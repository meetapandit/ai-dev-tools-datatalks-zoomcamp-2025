from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import Problem, CodeSubmission, ExecutionResult

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data
problems = [
    Problem(id="1", title="Two Sum", description="Return indices of the two numbers such that they add up to target.", initial_code="def two_sum(nums, target):\n    pass"),
    Problem(id="2", title="Reverse String", description="Reverse the input string.", initial_code="def reverse_string(s):\n    pass")
]

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
    # Mock execution
    return ExecutionResult(output="Hello World\n", status="success")
