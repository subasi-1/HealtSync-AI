# HealthSync AI — Forecasting, Stock-Out Detection & Alerts

The AI module for the HealthSync AI hackathon project: demand forecasting,
stock-out risk scoring, and alert generation for medicine inventory.

This runs anywhere — a plain terminal, VS Code, PyCharm, a server, a cron job,
or still in Colab via `notebooks/HealthSync_AI_Forecasting.ipynb` if you want
to explore interactively. The actual logic lives in `src/healthsync_ai/`, so
it's the same code no matter where you run it.

## Project structure

```
healthsync-ai/
├── main.py                    # CLI entry point
├── api.py                     # optional REST API (for Spring Boot / frontend to call)
├── requirements.txt
├── .env.example                # copy to .env and fill in real DB credentials
├── src/healthsync_ai/
│   ├── config.py               # all tunable thresholds
│   ├── synthetic_data.py       # fake data generator for testing/demo
│   ├── forecasting.py          # Section: forecasting logic
│   ├── stockout.py             # Section: stock-out detection
│   ├── alerts.py                # Section: alert rules
│   ├── pipeline.py              # ties the three together
│   ├── plotting.py              # saves forecast charts as PNG
│   └── db.py                    # Postgres read/write helpers
├── notebooks/
│   └── HealthSync_AI_Forecasting.ipynb   # same logic, Colab-friendly version
└── tests/
    └── test_pipeline.py
```

## Setup

```bash
git clone <your-repo-url>
cd healthsync-ai

python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

## Run it

With synthetic demo data (works immediately, no setup needed):

```bash
python main.py
```

With your own data:

```bash
python main.py --usage-csv usage.csv --medicine-csv medicines.csv
```

`usage.csv` needs columns: `medicine_id, date, quantity_used`
`medicines.csv` needs columns: `medicine_id, medicine_name, current_stock, reorder_threshold, expiry_date`
(`reorder_threshold` and `expiry_date` are optional — leave them out if you don't track them)

Two ready-made examples with the exact expected format are in `examples/` — hand
these to whoever's giving you the real data:

```bash
python main.py --usage-csv examples/example_usage.csv --medicine-csv examples/example_medicines.csv
```

Save a forecast chart for a specific medicine (useful for your demo/PPT):

```bash
python main.py --plot-medicine-id 1
```

Results (`forecast_results.csv`, `stockout_risk.csv`, `alerts.csv`) are written to `./output/`.

## Run tests

```bash
python tests/test_pipeline.py
# or, if you have pytest installed:
pytest tests/
```

## Connecting to the real database

1. Copy `.env.example` to `.env` and fill in your team's Postgres credentials. `.env` is gitignored — never commit real credentials.
2. **Open `src/healthsync_ai/db.py` and check the SQL in `load_usage_and_medicines()`.** It currently assumes tables named `medicine` and `medicine_usage_log` with columns `id, name, current_stock, reorder_threshold, expiry_date` / `medicine_id, date, quantity_used`. These are guesses — update them to match whatever Member 2 actually calls things. This is the one piece of this code I can't fill in for you since I don't have your real schema.
3. Ask whoever owns the backend to create these output tables (or run the SQL yourself):

```sql
CREATE TABLE forecast_results (
    id SERIAL PRIMARY KEY,
    medicine_id INT NOT NULL,
    medicine_name VARCHAR(255),
    forecast_date DATE NOT NULL,
    day_offset INT NOT NULL,
    predicted_usage NUMERIC,
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stockout_risk (
    id SERIAL PRIMARY KEY,
    medicine_id INT NOT NULL,
    medicine_name VARCHAR(255),
    current_stock INT,
    avg_daily_demand NUMERIC,
    days_left NUMERIC,
    risk_score NUMERIC,
    risk_level VARCHAR(20),
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    medicine_id INT NOT NULL,
    medicine_name VARCHAR(255),
    alert_type VARCHAR(50),
    severity VARCHAR(20),
    message TEXT,
    generated_at TIMESTAMP DEFAULT NOW()
);
```

4. Once steps 1-3 are done, switch to real data with a flag — no code editing needed:

```bash
python main.py --use-db
```

This reads from Postgres, runs the pipeline, and writes results back to
`forecast_results` / `stockout_risk` / `alerts` automatically.

## Exposing this to the rest of the team (optional)

If it's easier for the Spring Boot backend to call your logic over HTTP instead
of sharing a DB connection:

```bash
pip install fastapi uvicorn
uvicorn api:app --reload --port 8000              # synthetic data
USE_DB=true uvicorn api:app --reload --port 8000  # real Postgres data
```

Then `GET http://localhost:8000/forecast` returns forecast + risk + alerts as JSON —
callable from Java, JavaScript, or anything else that can make an HTTP request.

## Pushing this to GitHub

**If your team already has a shared repo** (likely, since work is split by module):

```bash
git clone <team-repo-url>
cd <team-repo>
git checkout -b feature/ai-forecasting

# copy all files from this healthsync-ai/ folder into an `ai/` subfolder of the repo
mkdir -p ai
cp -r /path/to/healthsync-ai/* ai/

git add ai/
git commit -m "Add AI forecasting, stock-out detection, and alert logic"
git push -u origin feature/ai-forecasting
# then open a Pull Request on GitHub
```

**If you're starting a fresh repo for just this part:**

```bash
cd healthsync-ai
git init
git add .
git commit -m "Initial commit: forecasting, stock-out detection, alerts"

# create an empty repo on github.com first, then:
git remote add origin https://github.com/<your-username>/healthsync-ai.git
git branch -M main
git push -u origin main
```

A couple of things worth double-checking before you push either way:
- `.env` is in `.gitignore` — confirm `git status` never shows it staged.
- `output/` (generated CSVs/PNGs) is also ignored, so you don't clutter the repo with regenerated files.
