# SideQuest

A full-stack application with Next.js frontend and Python FastAPI backend.

## Project Structure

```
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Utility functions and API client
│   └── public/       # Static assets
├── backend/          # Python FastAPI backend
│   ├── app/          # Application modules
│   ├── main.py       # FastAPI application entry point
│   └── requirements.txt
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Python 3.8+
- pip

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The backend API will be available at `http://localhost:8000`

### Environment Variables

#### Frontend
Copy `.env.example` to `.env.local` and configure:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend
Copy `.env.example` to `.env` and configure:
```
ENVIRONMENT=development
PORT=8000
FRONTEND_URL=http://localhost:3000
```

## Development

### Running Both Services

Open two terminal windows:

**Terminal 1 (Frontend):**
```bash
cd frontend && npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend && source venv/bin/activate && python main.py
```

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Python 3.x
- FastAPI
- Uvicorn
- Pydantic

## License

MIT
