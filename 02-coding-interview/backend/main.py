from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Dict
from models import Problem, CodeSubmission, ExecutionResult
from pathlib import Path

app = FastAPI()

# Update CORS to allow all origins in production (or configure as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        # Store connections by problem_id (room)
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, problem_id: str):
        await websocket.accept()
        if problem_id not in self.active_connections:
            self.active_connections[problem_id] = []
        self.active_connections[problem_id].append(websocket)

    def disconnect(self, websocket: WebSocket, problem_id: str):
        if problem_id in self.active_connections:
            self.active_connections[problem_id].remove(websocket)
            if not self.active_connections[problem_id]:
                del self.active_connections[problem_id]

    async def broadcast(self, message: str, problem_id: str, sender: WebSocket):
        if problem_id in self.active_connections:
            for connection in self.active_connections[problem_id]:
                if connection != sender:
                    await connection.send_text(message)

manager = ConnectionManager()

# Mock Data
problems = [
    Problem(
        id="1", 
        title="Two Sum", 
        description="Return indices of the two numbers such that they add up to target.", 
        starter_codes={
            "python": "def two_sum(nums, target):\n    pass",
            "javascript": "function twoSum(nums, target) {\n}",
            "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
            "go": "func twoSum(nums []int, target int) []int {\n    return nil\n}"
        }
    ),
    Problem(
        id="2", 
        title="Reverse String", 
        description="Reverse the input string.", 
        starter_codes={
            "python": "def reverse_string(s):\n    pass",
            "javascript": "function reverseString(s) {\n}",
            "java": "class Solution {\n    public String reverseString(String s) {\n        return \"\";\n    }\n}",
            "go": "func reverseString(s string) string {\n    return \"\"\n}"
        }
    )
]

@app.websocket("/ws/{problem_id}")
async def websocket_endpoint(websocket: WebSocket, problem_id: str):
    await manager.connect(websocket, problem_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast the code change to other users in the room
            await manager.broadcast(data, problem_id, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, problem_id)

@app.get("/problems", response_model=List[Problem])
def get_problems():
    return problems

@app.get("/problems/{problem_id}", response_model=Problem)
def get_problem(problem_id: str):
    for p in problems:
        if p.id == problem_id:
            return p
    raise HTTPException(status_code=404, detail="Problem not found")

@app.post("/submit", response_model=ExecutionResult)
def submit_code(submission: CodeSubmission):
    # Mock execution (will be replaced by frontend execution, but keeping API for compatibility or logging)
    return ExecutionResult(output="Execution moved to browser (Pyodide)\n", status="browser-only")

# Serve static files (frontend build)
static_dir = Path(__file__).parent.parent / "frontend" / "dist"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Serve index.html for all non-API routes (SPA fallback)
        file_path = static_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(static_dir / "index.html")
