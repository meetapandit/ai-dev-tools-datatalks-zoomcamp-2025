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
    # Note: Status changed to browser-only in recent update
    assert response.json()["status"] == "browser-only"

def test_websocket_connection():
    with client.websocket_connect("/ws/1") as websocket:
        websocket.send_text("Hello")
        # No broadcast back to sender in our logic, but connection shouldn't fail

def test_websocket_broadcast():
    with client.websocket_connect("/ws/test-room") as ws1:
        with client.websocket_connect("/ws/test-room") as ws2:
            ws1.send_text("Hello from ws1")
            data = ws2.receive_text()
            assert data == "Hello from ws1"
