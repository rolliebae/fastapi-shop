# Melschool CRM

Рабочий CRM MVP для Мелскула: FastAPI backend + React/Vite интерфейс для лидов, учеников, сделок и истории коммуникаций.

## Что есть в интерфейсе

- обзор с ключевыми CRM-метриками и ближайшими касаниями;
- kanban-воронка с drag-and-drop между этапами;
- таблица учеников с поиском;
- карточка ученика в боковой панели: контакты, статус, сделка, заметки и история взаимодействий;
- создание нового ученика и первой сделки из интерфейса;
- добавление звонков, Telegram-касаний, диагностик, занятий и заметок;
- responsive layout для ноутбука, планшета и телефона.

## Backend

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: `http://127.0.0.1:8000`  
Swagger: `http://127.0.0.1:8000/docs`

## Frontend

В новом терминале:

```bash
cd frontend
npm install
npm run dev
```

Интерфейс: `http://127.0.0.1:5173`

Vite проксирует запросы `/api/*` на FastAPI `http://127.0.0.1:8000`. Для отдельного backend URL можно задать `VITE_API_BASE_URL`.

## Основные API endpoints

- `GET /health`
- `POST /students`
- `GET /students`
- `GET /students/{id}`
- `PATCH /students/{id}`
- `POST /deals`
- `GET /deals`
- `PATCH /deals/{id}`
- `POST /activities`
- `GET /students/{id}/activities`
- `GET /dashboard`

## Статусы интерфейса

Student status: `lead`, `active`, `paused`, `archived`.

Deal stage: `new`, `diagnostic`, `offer`, `payment`, `won`, `lost`.
