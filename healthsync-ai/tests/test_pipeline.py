

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.healthsync_ai.synthetic_data import generate_synthetic_data
from src.healthsync_ai.pipeline import run_ai_pipeline


def test_pipeline_runs_and_returns_expected_shape():
    usage_df, medicine_df = generate_synthetic_data(n_medicines=3, n_days=20)
    forecast_df, risk_df, alerts_df = run_ai_pipeline(usage_df, medicine_df)

    assert len(forecast_df) > 0, "forecast_df should not be empty"
    assert len(risk_df) == 3, "one risk row per medicine"
    assert set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).issuperset(set(risk_df["risk_level"].unique()))
    assert (risk_df["risk_score"] >= 0).all() and (risk_df["risk_score"] <= 1).all()
    print("test_pipeline_runs_and_returns_expected_shape: PASSED")


def test_zero_stock_is_critical():
    usage_df, medicine_df = generate_synthetic_data(n_medicines=2, n_days=20)
    medicine_df.loc[0, "current_stock"] = 0
    _, risk_df, alerts_df = run_ai_pipeline(usage_df, medicine_df)

    zero_stock_row = risk_df[risk_df["medicine_id"] == medicine_df.iloc[0]["medicine_id"]].iloc[0]
    assert zero_stock_row["risk_level"] == "CRITICAL"
    print("test_zero_stock_is_critical: PASSED")


if __name__ == "__main__":
    test_pipeline_runs_and_returns_expected_shape()
    test_zero_stock_is_critical()
    print("\nAll tests passed.")
