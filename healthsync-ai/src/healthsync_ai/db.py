
import os


def get_engine():
    from dotenv import load_dotenv
    from sqlalchemy import create_engine

    load_dotenv()

    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    dbname = os.getenv("DB_NAME", "healthsync")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "")

    url = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}"
    return create_engine(url)


def load_usage_and_medicines(engine):
    import pandas as pd

    usage_df = pd.read_sql(
        "SELECT medicine_id, date, quantity_used FROM medicine_usage_log", engine
    )
    medicine_df = pd.read_sql(
        "SELECT id AS medicine_id, name AS medicine_name, current_stock, "
        "reorder_threshold, expiry_date FROM medicine",
        engine,
    )
    return usage_df, medicine_df


def save_results(engine, forecast_df, risk_df, alerts_df):
    forecast_df.to_sql("forecast_results", engine, if_exists="append", index=False)
    risk_df.to_sql("stockout_risk", engine, if_exists="append", index=False)
    alerts_df.to_sql("alerts", engine, if_exists="append", index=False)
