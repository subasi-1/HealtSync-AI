
CONFIG = {
    "horizons": [3, 5, 7],               # forecast next N days
    "recent_window_days": 7,              # baseline = average usage over last 7 days
    "trend_window_days": 14,              # trend = first half vs second half of last 14 days
    "safety_buffer_days": 2,              # extra buffer days added when scoring risk
    "low_stock_default_threshold": 20,    # fallback if a medicine has no reorder_threshold set
    "rapid_consumption_window_days": 3,   # "recent" window for spike detection
    "rapid_consumption_multiplier": 1.5,  # recent avg >= 1.5x normal avg -> alert
    "expiry_warning_days": 30,            # flag anything expiring within 30 days
    "risk_thresholds": {"high": 0.7, "medium": 0.4},  # risk_score cutoffs
}
