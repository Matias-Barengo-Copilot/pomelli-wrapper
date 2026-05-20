---
name: testing-python
description: Generate pytest tests following team conventions. Creates comprehensive test coverage for happy path, edge cases, and error handling.
argument-hint: "[file-path or module-name]"
allowed-tools: Read, Glob, Grep
---

# Generate Pytest Tests

Generate comprehensive pytest tests for Python code following team conventions and best practices.

This skill creates tests that cover happy path scenarios, edge cases, and error handling with proper fixtures, parametrization, and mocking patterns.

## When to Use

Use this skill when:
- Implementing new features that need test coverage
- Following TDD principles (write tests before implementation)
- Adding tests to existing code that lacks coverage
- Ensuring consistent test patterns across the codebase
- Testing FastAPI routes, services, utilities, or data models

## Arguments

Code to test: `$ARGUMENTS`

If a file path is provided, read it first.
If a module name is provided, find and read the relevant files.
If nothing provided, ask the user which code needs testing.

## Process

### Step 1: Read and analyze the code

Use Read, Glob, and Grep to:
- Read the target file(s) to understand structure
- Identify function signatures, class definitions, and type hints
- Find existing tests to match naming and style conventions
- Locate conftest.py files to understand available fixtures
- Identify dependencies that need mocking (databases, APIs, external services)

### Step 2: Identify test scenarios

For each function, method, or endpoint, categorize test cases:

**Happy path:**
- Normal successful execution
- Valid inputs producing expected outputs
- Standard workflows end-to-end

**Edge cases:**
- Boundary conditions (empty lists, zero values, max values)
- Null/None inputs where applicable
- Edge timestamps or dates
- Empty strings, whitespace-only strings
- Single-item collections
- Very large inputs (if size matters)

**Error cases:**
- Invalid input types
- Missing required parameters
- Violation of constraints (negative numbers where positive required)
- External dependency failures (database errors, API timeouts)
- Permission/authorization failures
- Not found scenarios

### Step 3: Generate the test file

Create a test file with this structure:

```python
"""Tests for [module_name]."""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from [module] import [code_under_test]


# Fixtures (if needed)
@pytest.fixture
def sample_data():
    """Fixture description."""
    return {"key": "value"}


# Happy path tests
def test_[function_name]_happy_path():
    """Test [function_name] with valid input."""
    # Arrange
    input_data = ...
    expected_output = ...

    # Act
    result = function_name(input_data)

    # Assert
    assert result == expected_output


# Edge case tests (use parametrize for multiple cases)
@pytest.mark.parametrize("input_data,expected", [
    ([], expected_for_empty),
    ([single_item], expected_for_one),
    (None, expected_for_none),
])
def test_[function_name]_edge_cases(input_data, expected):
    """Test [function_name] with edge case inputs."""
    result = function_name(input_data)
    assert result == expected


# Error handling tests
def test_[function_name]_invalid_input():
    """Test [function_name] raises error for invalid input."""
    with pytest.raises(ValueError, match="expected error message"):
        function_name(invalid_input)


# Integration tests (if applicable)
@pytest.mark.integration
def test_[function_name]_integration():
    """Test [function_name] with real dependencies."""
    # Test with actual database or external service
    pass


# Async tests (for FastAPI and async code)
@pytest.mark.asyncio
async def test_async_[function_name]():
    """Test async [function_name]."""
    result = await async_function_name()
    assert result is not None
```

## Pytest Conventions

### Test File Naming
- `test_*.py` or `*_test.py`
- Match the source file name: `utils.py` → `test_utils.py`
- Place in `tests/` directory mirroring source structure

### Test Function Naming
- `test_<what_it_tests>`
- Be specific: `test_calculate_total_with_empty_list`
- Use descriptive names that explain the scenario

### Fixtures
- Define fixtures in `conftest.py` for reuse across tests
- Use function-scoped fixtures by default
- Use `@pytest.fixture` decorator
- Name fixtures descriptively: `sample_user`, `mock_database`, `test_client`

### Parametrization
- Use `@pytest.mark.parametrize` for testing multiple inputs
- Group related test cases together
- Include descriptive parameter names
- Format: `@pytest.mark.parametrize("input,expected", [(val1, exp1), (val2, exp2)])`

### Markers
- `@pytest.mark.slow` - For slow-running tests
- `@pytest.mark.integration` - For integration tests
- `@pytest.mark.asyncio` - For async tests
- `@pytest.mark.skip` - To skip tests temporarily
- Define custom markers in `pytest.ini` or `pyproject.toml`

### Assertions
- Use simple assert statements (pytest rewrites them)
- One logical assertion per test when possible
- Use `pytest.raises()` for exception testing
- Use `pytest.approx()` for floating-point comparisons
- Be specific with error messages: `pytest.raises(ValueError, match="expected message")`

### Arrange-Act-Assert Pattern
Structure every test clearly:
```python
def test_example():
    # Arrange - Set up test data and preconditions
    input_data = create_test_data()

    # Act - Execute the code under test
    result = function_under_test(input_data)

    # Assert - Verify the outcome
    assert result == expected_value
```

## Mocking Patterns

### External Dependencies
Mock databases, APIs, file I/O, and external services:

```python
from unittest.mock import patch, Mock

@patch('module.external_api_call')
def test_with_mocked_api(mock_api):
    """Test function that calls external API."""
    mock_api.return_value = {"status": "success"}
    result = function_that_uses_api()
    assert result["status"] == "success"
    mock_api.assert_called_once()
```

### Database Mocking
```python
@pytest.fixture
def mock_db_session():
    """Mock database session."""
    session = Mock()
    session.query.return_value.filter.return_value.first.return_value = None
    return session

def test_database_query(mock_db_session):
    """Test function with mocked database."""
    result = get_user_by_id(mock_db_session, user_id=1)
    assert result is None
```

### Async Mocking
```python
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_async_function():
    """Test async function with mocked dependency."""
    mock_service = AsyncMock()
    mock_service.fetch_data.return_value = {"data": "value"}

    result = await process_data(mock_service)
    assert result["data"] == "value"
```

## FastAPI Testing Patterns

### Testing Endpoints
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_item():
    """Test GET /items/{item_id} endpoint."""
    response = client.get("/items/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1

def test_create_item():
    """Test POST /items endpoint."""
    item_data = {"name": "Test Item", "price": 10.99}
    response = client.post("/items/", json=item_data)
    assert response.status_code == 201
    assert response.json()["name"] == "Test Item"

def test_item_not_found():
    """Test GET /items/{item_id} with non-existent item."""
    response = client.get("/items/9999")
    assert response.status_code == 404
```

### Testing Dependencies
```python
from fastapi import Depends

def override_get_db():
    """Override database dependency for testing."""
    return mock_db

app.dependency_overrides[get_db] = override_get_db

def test_endpoint_with_db_dependency():
    """Test endpoint that uses database dependency."""
    response = client.get("/users/1")
    assert response.status_code == 200
```

### Testing Async Endpoints
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_async_endpoint():
    """Test async endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/async-items/")
    assert response.status_code == 200
```

### Testing Authentication
```python
def test_protected_endpoint_without_auth():
    """Test protected endpoint returns 401 without authentication."""
    response = client.get("/protected")
    assert response.status_code == 401

def test_protected_endpoint_with_auth():
    """Test protected endpoint with valid token."""
    headers = {"Authorization": "Bearer valid_token"}
    response = client.get("/protected", headers=headers)
    assert response.status_code == 200
```

## Type Hints in Tests

Use type hints for clarity:

```python
from typing import List, Dict, Any
import pytest

def test_process_items() -> None:
    """Test item processing."""
    items: List[Dict[str, Any]] = [{"id": 1}, {"id": 2}]
    result: List[int] = process_items(items)
    assert result == [1, 2]

@pytest.fixture
def sample_user() -> Dict[str, str]:
    """Create sample user for testing."""
    return {"name": "Test User", "email": "test@example.com"}
```

## Coverage Guidelines

Aim for meaningful coverage, not 100%:

- **Critical paths:** 100% coverage for core business logic
- **Happy path:** Every public function/method should have at least one happy path test
- **Error handling:** Test all explicitly handled exceptions
- **Edge cases:** Test boundary conditions and known problematic inputs
- **Integration points:** Test interfaces with external systems

Don't over-test:
- Skip testing framework code, getters/setters, or trivial property access
- Don't test private methods directly (test through public interface)
- Don't duplicate tests that already exist

## Test Organization

Group tests logically:

```python
class TestUserAuthentication:
    """Tests for user authentication."""

    def test_login_success(self):
        """Test successful login."""
        pass

    def test_login_invalid_password(self):
        """Test login with invalid password."""
        pass

    def test_login_nonexistent_user(self):
        """Test login with nonexistent user."""
        pass


class TestUserRegistration:
    """Tests for user registration."""

    def test_register_new_user(self):
        """Test registering a new user."""
        pass
```

## Output Format

Generate a complete test file with:

1. **Module docstring** - Brief description of what's being tested
2. **Imports** - All necessary imports (pytest, mocks, code under test)
3. **Fixtures** - Shared test data and setup
4. **Test functions** - Organized by category (happy path, edge cases, errors)
5. **Comments** - Clear explanations of test purpose and assertions

## Quality Checklist

A good test suite should:
- [ ] Cover happy path scenarios
- [ ] Test boundary conditions and edge cases
- [ ] Verify error handling and exceptions
- [ ] Use appropriate fixtures for setup/teardown
- [ ] Mock external dependencies (databases, APIs)
- [ ] Follow clear arrange-act-assert structure
- [ ] Have descriptive test names
- [ ] Use parametrize for multiple similar cases
- [ ] Include type hints where helpful
- [ ] Run independently (no test order dependencies)
- [ ] Be fast (mock slow operations)
- [ ] Be deterministic (same result every run)

Avoid:
- Testing implementation details instead of behavior
- Brittle tests that break with refactoring
- Tests without clear assertions
- Over-mocking (mock what you must, not what you can)
- Duplicate test logic
- Tests that depend on external state
- Vague test names like `test_function_1`

## TDD Workflow

When following Test-Driven Development:

1. **Write the test first** - Define expected behavior through tests
2. **Run the test** - Verify it fails (red)
3. **Write minimal code** - Make the test pass (green)
4. **Refactor** - Improve code while keeping tests green
5. **Repeat** - Add next test case

This skill supports TDD by generating test scaffolding before implementation exists.

## Sources

This skill is based on research and best practices from:
- [Modern Test-Driven Development in Python | TestDriven.io](https://testdriven.io/blog/modern-tdd/)
- [pytest Tutorial: Effective Python Testing – Real Python](https://realpython.com/pytest-python-testing/)
- [Test-Driven Development With pytest – Real Python](https://realpython.com/courses/test-driven-development-pytest/)
- [AI-Powered Test-Driven Development (TDD): Fundamentals & Best Practices 2025](https://www.nopaccelerate.com/test-driven-development-guide-2025/)
- [Python Testing Skill for Claude Code | pytest Automation](https://mcpmarket.com/es/tools/skills/python-testing-pytest)
- [pytest Test Framework - Claude Skill | MCP Hub](https://www.aimcp.info/en/skills/120285a5-a801-41c7-b0de-7af417300e9b)
