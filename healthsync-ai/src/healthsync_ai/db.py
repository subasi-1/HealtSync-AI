import os


def get_engine():
    from dotenv import load_dotenv
    from sqlalchemy import create_engine

    load_dotenv()

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")

    # SQLAlchemy expects this scheme
    if database_url.startswith("postgres://"):
        database_url = database_url.replace(
            "postgres://",
            "postgresql+psycopg2://",
            1
        )
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace(
            "postgresql://",
            "postgresql+psycopg2://",
            1
        )

    return create_engine(
        database_url,
        pool_pre_ping=True,
        pool_recycle=300,
    )