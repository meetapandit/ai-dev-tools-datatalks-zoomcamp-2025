from pydantic import BaseModel
from typing import List, Optional

class Problem(BaseModel):
    id: str
    title: str
    description: str
    initial_code: str

class CodeSubmission(BaseModel):
    code: str
    language: str

class ExecutionResult(BaseModel):
    output: str
    status: str
    error: Optional[str] = None
