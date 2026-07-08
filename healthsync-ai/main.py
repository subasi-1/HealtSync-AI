
import argparse
import os

import pandas as pd

from src.healthsync_ai.synthetic_data import generate_synthetic_data
from src.healthsync_ai.pipeline import run_ai_pipeline
from src.healthsync_ai.plotting import plot_medicine_forecast


def load_usage_csv(path):
    df = pd.read_csv(path)
    required = {"medicine_id", "date", "quantity_used"}
    missing = required - set(df.columns)
    if missing:
        raise SystemExit(f"Usage CSV is missing required column(s): {sorted(missing)}")
    df["date"] = pd.to_datetime(df["date"])
    return df


def load_medicine_csv(path):
    df = pd.read_csv(path)
    required = {"medicine_id", "medicine_name", "current_stock"}
    missing = required - set(df.columns)
    if missing:
        raise SystemExit(f"Medicine CSV is missing required column(s): {sorted(missing)}")

    # expiry_date and reorder_threshold are optional - fill them in if absent
    # instead of crashing, since not every team tracks both.
    if "expiry_date" in df.columns:
        df["expiry_date"] = pd.to_datetime(df["expiry_date"], errors="coerce")
    else:
        df["expiry_date"] = pd.NaT

    if "reorder_threshold" not in df.columns:
        df["reorder_threshold"] = None

    return df


def main():
    parser = argparse.ArgumentParser(description="HealthSync AI forecasting & alerts pipeline")
    parser.add_argument("--usage-csv", type=str, default=None,
                         help="CSV with columns: medicine_id, date, quantity_used")
    parser.add_argument("--medicine-csv", type=str, default=None,
                         help="CSV with columns: medicine_id, medicine_name, current_stock, "
                              "reorder_threshold, expiry_date")
    parser.add_argument("--plot-medicine-id", type=int, default=None,
                         help="Save a forecast chart (PNG) for this medicine id")
    parser.add_argument("--output-dir", type=str, default="output",
                         help="Where result CSVs and charts are saved")
    parser.add_argument("--use-db", action="store_true",
                         help="Read from and write results to Postgres (needs a valid .env). "
                              "Overrides --usage-csv/--medicine-csv if both are given.")
    args = parser.parse_args()

    engine = None
    if args.use_db:
        from src.healthsync_ai.db import get_engine, load_usage_and_medicines
        print("Reading from Postgres (.env)...\n")
        engine = get_engine()
        usage_df, medicine_df = load_usage_and_medicines(engine)
    elif args.usage_csv and args.medicine_csv:
        usage_df = load_usage_csv(args.usage_csv)
        medicine_df = load_medicine_csv(args.medicine_csv)
    elif args.usage_csv or args.medicine_csv:
        raise SystemExit("Both --usage-csv and --medicine-csv are needed together - only one was given.")
    else:
        print("No CSVs provided - using synthetic demo data.\n")
        usage_df, medicine_df = generate_synthetic_data()

    forecast_df, risk_df, alerts_df = run_ai_pipeline(usage_df, medicine_df)

    if args.use_db:
        from src.healthsync_ai.db import save_results
        save_results(engine, forecast_df, risk_df, alerts_df)
        print("Results written to forecast_results / stockout_risk / alerts tables.\n")

    os.makedirs(args.output_dir, exist_ok=True)
    forecast_df.to_csv(os.path.join(args.output_dir, "forecast_results.csv"), index=False)
    risk_df.to_csv(os.path.join(args.output_dir, "stockout_risk.csv"), index=False)
    alerts_df.to_csv(os.path.join(args.output_dir, "alerts.csv"), index=False)

    print("=== STOCK-OUT RISK ===")
    cols = ["medicine_name", "current_stock", "avg_daily_demand", "days_left", "risk_score", "risk_level"]
    print(risk_df[cols].sort_values("risk_score", ascending=False).to_string(index=False))

    print("\n=== ALERTS ===")
    if len(alerts_df):
        print(alerts_df[["medicine_name", "alert_type", "severity", "message"]].to_string(index=False))
    else:
        print("No alerts triggered.")

    print(f"\nCSV results saved to ./{args.output_dir}/")

    if args.plot_medicine_id:
        path = plot_medicine_forecast(args.plot_medicine_id, usage_df, forecast_df, medicine_df, args.output_dir)
        print(f"Chart saved to {path}")


if __name__ == "__main__":
    main()
