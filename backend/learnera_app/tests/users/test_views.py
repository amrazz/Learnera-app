import pytest
from django.urls import reverse
from loguru import logger
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator


@pytest.mark.django_db
def test_user_login(user, client):

    payload = dict(
        username="test_user1",
        password="TestPass@123",
        role="is_student",
    )
    response = client.post(reverse("user-login"), payload, format="json")
    data = response.data

    logger.info(f"Login response data: {data}")

    assert response.status_code == 200
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["role"] == payload["role"]
    assert "password" not in data
    assert data["userEmail"] == "testuser1@example.com"
    assert user.username == payload["username"]


@pytest.mark.django_db
def test_user_login_fail(user, client):
    payload = dict(username="test_user10", password="TestPass@10", role="is_student")
    response = client.post(reverse("user-login"), payload, format="json")
    data = response.data

    logger.info(f"Login response data: {data}")

    assert response.status_code == 400
    assert "access_token" not in data
    assert "refresh_token" not in data
    assert "error" in data
    assert "details" in data
    assert isinstance(data["details"], dict)
    assert data["error"] == "Login Failed"


@pytest.mark.django_db
def test_logout_user(auth_client_tokens):
    client, refresh, _ = auth_client_tokens
    response = client.post(
        reverse("user-logout"), {"refreshToken": str(refresh)}, format="json"
    )

    assert response.status_code == 205
    assert response.data["message"] == "Logout Successful"


@pytest.mark.django_db
def test_logout_user_fail(auth_client):
    response = auth_client.post(reverse("user-logout"), format="json")
    assert response.status_code == 400
    assert "error" in response.data
    assert response.data["error"] == "Refresh token is required"


@pytest.mark.django_db
def test_set_password(user, client):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    url = reverse("set-password", args=[uid, token])
    payload = dict(new_password="NewPass@123", confirm_password="NewPass@123")

    response = client.post(url, payload, format="json")

    assert response.status_code == 200
    assert response.data["message"] == "Password set successfully"


@pytest.mark.django_db
def test_set_password_mismatch(user, client):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    url = reverse("set-password", args=[uid, token])
    payload = dict(new_password="FalsePass@123", confirm_password="FalsePass@321")

    response = client.post(url, payload, format="json")

    assert response.status_code == 400
    assert response.data["error"] == "Passwords do not match"
