
from datetime import datetime

import pandas as pd

from .config import CONFIG


def detect_stockout_risk(medicine_id, current_stock, forecast_df: pd.DataFrame, baseline_avg, config=CONFIG):
    max_horizon = max(config["horizons"])
    buffer = config["safety_buffer_days"]

    avg_daily_demand = forecast_df["predicted_usage"].mean() if len(forecast_df) else baseline_avg
    if avg_daily_demand is None or pd.isna(avg_daily_demand):
        avg_daily_demand = 0.0

    if avg_daily_demand <= 0:
        days_left = float("inf")
    else:
        days_left = current_stock / avg_daily_demand

    effective_horizon = max_horizon + buffer

    if current_stock <= 0:
        risk_score, risk_level = 1.0, "CRITICAL"
    else:
        if days_left == float("inf"):
            risk_score = 0.0
        else:
            risk_score = max(0.0, min(1.0, 1 - (days_left / effective_horizon)))

        thresholds = config["risk_thresholds"]
        if risk_score >= thresholds["high"]:
            risk_level = "HIGH"
        elif risk_score >= thresholds["medium"]:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

    return {
        "medicine_id": medicine_id,
        "current_stock": current_stock,
        "avg_daily_demand": round(avg_daily_demand, 2),
        "days_left": round(days_left, 1) if days_left != float("inf") else None,
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "generated_at": datetime.now(),
    }
