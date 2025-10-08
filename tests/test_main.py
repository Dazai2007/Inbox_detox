import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    """Test the main homepage endpoint."""
    response = client.get("/")
    assert response.status_code == 200

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_api_info():
    """Test the API info endpoint."""
    response = client.get("/api/info")
    assert response.status_code == 200
    data = response.json()
    assert data["app_name"] == "Inbox Detox"

def test_demo_analyze():
    """Test the demo email analysis endpoint."""
    test_email = {
        "subject": "Meeting Tomorrow",
        "content": "Hi, let's meet tomorrow at 2pm to discuss the project."
    }
    
    response = client.post("/emails/demo-analyze", json=test_email)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "category" in data
    assert "confidence_score" in data

def test_register_user():
    """Test user registration."""
    user_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    response = client.post("/auth/register", json=user_data)
    # Should succeed or fail with user already exists
    assert response.status_code in [200, 400]