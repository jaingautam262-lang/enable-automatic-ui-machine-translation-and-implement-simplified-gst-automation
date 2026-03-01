"""
Tests for Flask application and routes
"""

import pytest
from src.app import create_app


@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app("testing")
    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["service"] == "gst-ui-automation"


def test_translate_endpoint(client):
    """Test translation endpoint"""
    payload = {
        "text": "Hello, World!",
        "target_language": "es",
        "source_language": "en"
    }
    response = client.post(
        "/api/translation/translate",
        json=payload,
        content_type="application/json"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["original_text"] == "Hello, World!"


def test_translate_missing_fields(client):
    """Test translation endpoint with missing fields"""
    payload = {"text": "Hello"}
    response = client.post(
        "/api/translation/translate",
        json=payload,
        content_type="application/json"
    )
    assert response.status_code == 400


def test_supported_languages(client):
    """Test supported languages endpoint"""
    response = client.get("/api/translation/languages")
    assert response.status_code == 200
    data = response.get_json()
    assert "languages" in data
    assert "es" in data["languages"]


def test_gsp_submit(client):
    """Test GSP submission endpoint"""
    payload = {
        "form_data": {"test": "data"},
        "form_type": "GSTR1"
    }
    response = client.post(
        "/api/gst/proxy/gsp/submit",
        json=payload,
        content_type="application/json"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert "submission_id" in data


def test_cleartax_submit(client):
    """Test ClearTax submission endpoint"""
    payload = {
        "form_data": {"test": "data"},
        "form_type": "GSTR1"
    }
    response = client.post(
        "/api/gst/proxy/cleartax/submit",
        json=payload,
        content_type="application/json"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert "submission_id" in data


def test_submission_status(client):
    """Test submission status endpoint"""
    # First, submit a form
    payload = {"form_data": {"test": "data"}} 
    submit_response = client.post(
        "/api/gst/proxy/gsp/submit",
        json=payload,
        content_type="application/json"
    )
    submission_id = submit_response.get_json()["submission_id"]
    
    # Then check status
    status_response = client.get(f"/api/gst/status/{submission_id}")
    assert status_response.status_code == 200
    data = status_response.get_json()
    assert data["status"] == "success"
    assert data["submission_id"] == submission_id
