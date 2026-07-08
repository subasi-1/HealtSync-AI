
from datetime import datetime, timedelta

import numpy as np
import pandas as pd


def generate_synthetic_data(n_medicines: int = 6, n_days: int = 30, seed: int = 42):
    rng = np.random.default_rng(seed)
    names = ["Paracetamol", "Amoxicillin", "ORS Sachets", "Insulin", "Iron Tablets", "Cough Syrup"]

    medicines = []
    for i, name in enumerate(names[:n_medicines]):
        medicines.append({
            "medicine_id": i + 1,
            "medicine_name": name,
            "current_stock": int(rng.integers(10, 200)),
            "reorder_threshold": int(rng.integers(15, 40)),
            "expiry_date": (datetime.now() + timedelta(days=int(rng.integers(5, 200)))).date(),
        })
    medicine_df = pd.DataFrame(medicines)

    rows = []
    end_date = datetime.now().date()
    for med in medicines:
        base = rng.integers(5, 25)
        trend = rng.uniform(-0.3, 0.5)
        for d in range(n_days, 0, -1):
            date = end_date - timedelta(days=d)
            noise = rng.normal(0, base * 0.2)
            qty = max(0, round(base + trend * (n_days - d) + noise))
            rows.append({"medicine_id": med["medicine_id"], "date": date, "quantity_used": qty})
    usage_df = pd.DataFrame(rows)

    return usage_df, medicine_df
