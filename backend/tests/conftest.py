# Pytest fixtures placeholder

import pytest


@pytest.fixture
def user():
    return {"id": 1, "username": "test"}
