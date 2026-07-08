
from datetime import datetime

import pandas as pd

from .config import CONFIG


def generate_alerts(medicine_id, medicine_name, current_stock, reorder_threshold,
                     expiry_date, usage_df: pd.DataFrame, risk_row, config=CONFIG):
    alerts = []
    now = datetime.now()

    # 1. Low stock alert
    threshold = reorder_threshold if reorder_threshold is not None else config["low_stock_default_threshold"]
    if current_stock <= threshold:
        alerts.append({
            "medicine_id": medicine_id, "medicine_name": medicine_name,
            "alert_type": "LOW_STOCK",
            "severity": "HIGH" if current_stock <= threshold * 0.5 else "MEDIUM",
            "message": f"{medicine_name}: stock ({current_stock}) at/below reorder threshold ({threshold}).",
            "generated_at": now,
        })

    # 2. Predicted stock-out alert
    if risk_row["risk_level"] in ("HIGH", "CRITICAL"):
        days_txt = f"{risk_row['days_left']} days" if risk_row["days_left"] is not None else "unknown"
        alerts.append({
            "medicine_id": medicine_id, "medicine_name": medicine_name,
            "alert_type": "PREDICTED_STOCKOUT", "severity": risk_row["risk_level"],
            "message": f"{medicine_name}: predicted to run out in ~{days_txt} at current usage rate.",
            "generated_at": now,
        })

    # 3. Rapid consumption alert
    df = usage_df[usage_df["medicine_id"] == medicine_id].copy()
    df["date"] = pd.to_datetime(df["date"])
    last_date = df["date"].max()
    recent_win = config["rapid_consumption_window_days"]
    recent_avg = df[df["date"] > last_date - pd.Timedelta(days=recent_win)]["quantity_used"].mean()
    normal_avg = df[df["date"] > last_date - pd.Timedelta(days=config["trend_window_days"])]["quantity_used"].mean()
    if normal_avg and recent_avg and normal_avg > 0 and recent_avg >= config["rapid_consumption_multiplier"] * normal_avg:
        alerts.append({
            "medicine_id": medicine_id, "medicine_name": medicine_name,
            "alert_type": "RAPID_CONSUMPTION", "severity": "MEDIUM",
            "message": (f"{medicine_name}: usage over last {recent_win} days ({recent_avg:.1f}/day) "
                        f"is well above normal ({normal_avg:.1f}/day)."),
            "generated_at": now,
        })

    # 4. Expiry alert (optional field)
    if expiry_date is not None:
        expiry_ts = pd.to_datetime(expiry_date)
        days_to_expiry = (expiry_ts - pd.Timestamp(now.date())).days
        if days_to_expiry <= config["expiry_warning_days"]:
            alerts.append({
                "medicine_id": medicine_id, "medicine_name": medicine_name,
                "alert_type": "EXPIRY", "severity": "HIGH" if days_to_expiry <= 7 else "MEDIUM",
                "message": f"{medicine_name}: expires in {days_to_expiry} days ({expiry_ts.date()}).",
                "generated_at": now,
            })

    return alerts
