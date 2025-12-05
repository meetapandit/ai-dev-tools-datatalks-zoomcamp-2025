from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_problems():
    response = client.get("/problems")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_read_problem():
    response = client.get("/problems/1")
    assert response.status_code == 200
    assert response.json()["id"] == "1"

def test_read_problem_not_found():
    response = client.get("/problems/999")
    assert response.status_code == 404

def test_submit_code():
    response = client.post("/submit", json={"code": "print('hello')", "language": "python"})
    assert response.status_code == 200
    assert response.json()["status"] == "success"
