
import pandas as pd

from .config import CONFIG


def compute_forecast(usage_df: pd.DataFrame, medicine_id, as_of_date=None, config=CONFIG):
    df = usage_df[usage_df["medicine_id"] == medicine_id].copy()
    df["date"] = pd.to_datetime(df["date"])

    if as_of_date is None:
        as_of_date = df["date"].max()
    else:
        as_of_date = pd.to_datetime(as_of_date)

    df = df[df["date"] <= as_of_date].sort_values("date")

    recent_window = config["recent_window_days"]
    trend_window = config["trend_window_days"]

    recent = df[df["date"] > as_of_date - pd.Timedelta(days=recent_window)]
    baseline_avg = recent["quantity_used"].mean() if len(recent) else 0.0
    if pd.isna(baseline_avg):
        baseline_avg = 0.0

    trend_data = df[df["date"] > as_of_date - pd.Timedelta(days=trend_window)]
    daily_trend = 0.0
    if len(trend_data) >= trend_window:
        half = trend_window // 2
        first_half_avg = trend_data.iloc[:half]["quantity_used"].mean()
        second_half_avg = trend_data.iloc[half:]["quantity_used"].mean()
        daily_trend = (second_half_avg - first_half_avg) / half

    max_horizon = max(config["horizons"])
    daily_rows = []
    for day_offset in range(1, max_horizon + 1):
        predicted = max(baseline_avg + daily_trend * day_offset, 0.0)
        daily_rows.append({
            "medicine_id": medicine_id,
            "forecast_date": (as_of_date + pd.Timedelta(days=day_offset)).date(),
            "day_offset": day_offset,
            "predicted_usage": round(predicted, 2),
        })
    forecast_df = pd.DataFrame(daily_rows)

    cumulative = {}
    for h in config["horizons"]:
        cumulative[h] = round(forecast_df[forecast_df["day_offset"] <= h]["predicted_usage"].sum(), 2)

    return forecast_df, cumulative, baseline_avg, daily_trend
