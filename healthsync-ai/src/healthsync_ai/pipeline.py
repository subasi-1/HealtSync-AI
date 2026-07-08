
import pandas as pd

from .config import CONFIG
from .forecasting import compute_forecast
from .stockout import detect_stockout_risk
from .alerts import generate_alerts


def run_ai_pipeline(usage_df: pd.DataFrame, medicine_df: pd.DataFrame, config=CONFIG):
    all_forecasts, all_risks, all_alerts = [], [], []

    for _, med in medicine_df.iterrows():
        mid = med["medicine_id"]

        f_df, cumulative, baseline_avg, trend = compute_forecast(usage_df, mid, config=config)
        f_df["medicine_name"] = med["medicine_name"]
        all_forecasts.append(f_df)

        risk_row = detect_stockout_risk(mid, med["current_stock"], f_df, baseline_avg, config)
        risk_row["medicine_name"] = med["medicine_name"]
        all_risks.append(risk_row)

        alerts = generate_alerts(
            mid, med["medicine_name"], med["current_stock"],
            med.get("reorder_threshold"), med.get("expiry_date"),
            usage_df, risk_row, config,
        )
        all_alerts.extend(alerts)

    forecast_result_df = pd.concat(all_forecasts, ignore_index=True)
    risk_result_df = pd.DataFrame(all_risks)
    alerts_result_df = pd.DataFrame(all_alerts)
    return forecast_result_df, risk_result_df, alerts_result_df
