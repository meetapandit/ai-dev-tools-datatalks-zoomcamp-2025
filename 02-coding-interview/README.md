# Coding Interview Platform

A real-time collaborative coding interview platform built with **FastAPI** (Backend) and **React** (Frontend).

## Features
- **Real-time Collaboration**: Code changes are synced instantly between users in the same room.
- **In-Browser Execution**: Python code is executed safely in the browser using **Pyodide** (WASM).
- **Monaco Editor**: Professional-grade code editor with syntax highlighting.
- **API**: Fully documented OpenAPI backend.

## Prerequisites
- **Python 3.12+**
- **Node.js 20+**
- **uv** (Python package manager)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd 02-coding-interview
   ```

2. **Backend Setup**
   ```bash
   cd backend
   uv sync
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Everything (Unified)**
   ```bash
   npm run dev
   ```
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:5173`

### Alternative (Manual)
1. **Start Backend**
   ```bash
   cd backend && uv run fastapi dev
   ```
2. **Start Frontend**
   ```bash
   cd frontend && npm run dev
   ```

## Running Tests

### Backend Integration Tests
   ```bash
   cd backend
   uv run pytest
   ```

## Architecture
- **Backend**: FastAPI manages REST endpoints for problems and WebSockets for real-time sync.
- **Frontend**: React uses Monaco Editor for editing and Pyodide for executing code client-side.
- **State Sync**: Changes are broadcasted via WebSockets to all connected clients in a specific problem room.
