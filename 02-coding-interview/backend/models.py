from pydantic import BaseModel
from typing import List, Optional

class Problem(BaseModel):
    id: str
    title: str
    description: str
    starter_codes: dict[str, str]  # Map language -> code

class CodeSubmission(BaseModel):
    code: str
    language: str

class ExecutionResult(BaseModel):
    output: str
    status: str
    error: Optional[str] = None
