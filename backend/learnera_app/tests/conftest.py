import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture
def user():
    return User.objects.create_user(
        username="test_user1",
        password="TestPass@123",
        email="testuser1@example.com",
        is_student=True,
    )


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def auth_client(user, client):
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(access)}")
    return client


@pytest.fixture
def auth_client_tokens(user, client):
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(access)}")
    return client, str(refresh), str(access)
