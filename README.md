# Melschool CRM

FastAPI CRM backend for Melschool, repurposed from the original shop prototype.

## CRM MVP

- students/leads with parent contacts, grade, exam, subject, source and owner;
- sales deals with pipeline stage, amount, probability and next contact date;
- activity timeline for calls, Telegram messages, diagnostics, lessons and notes;
- dashboard metrics for leads, active students, won deals and weighted pipeline;
- SQLite by default, configurable with `DATABASE_URL`.

## Run

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` for Swagger UI.

## Main endpoints

- `GET /health`
- `POST /students`
- `GET /students`
- `GET /students/{id}`
- `PATCH /students/{id}`
- `POST /deals`
- `GET /deals`
- `POST /activities`
- `GET /students/{id}/activities`
- `GET /dashboard`

## Suggested CRM statuses

Student status: `lead`, `diagnostic`, `trial`, `active`, `paused`, `finished`, `lost`.

Deal stage: `new`, `contacted`, `diagnostic_booked`, `diagnostic_done`, `offer`, `payment_pending`, `won`, `lost`.
