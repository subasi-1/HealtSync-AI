
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd


def plot_medicine_forecast(medicine_id, usage_df, forecast_df, medicine_df, output_dir="output"):
    name = medicine_df[medicine_df["medicine_id"] == medicine_id]["medicine_name"].iloc[0]

    hist = usage_df[usage_df["medicine_id"] == medicine_id].copy()
    hist["date"] = pd.to_datetime(hist["date"])

    fc = forecast_df[forecast_df["medicine_id"] == medicine_id].copy()
    fc["forecast_date"] = pd.to_datetime(fc["forecast_date"])

    plt.figure(figsize=(9, 4))
    plt.plot(hist["date"], hist["quantity_used"], label="Actual usage", marker="o", markersize=3)
    plt.plot(fc["forecast_date"], fc["predicted_usage"], label="Forecast", marker="o", markersize=3, linestyle="--")
    plt.axvline(hist["date"].max(), color="gray", linestyle=":", linewidth=1)
    plt.title(f"Usage & Forecast - {name}")
    plt.xlabel("Date")
    plt.ylabel("Units used")
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()

    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, f"forecast_{medicine_id}.png")
    plt.savefig(path)
    plt.close()
    return path
