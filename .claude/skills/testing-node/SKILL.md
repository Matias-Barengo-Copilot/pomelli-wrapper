---
name: testing-node
description: Generate Jest and React Testing Library tests following team conventions. Creates comprehensive test coverage for components, hooks, and utilities.
argument-hint: "[file-path or component-name]"
allowed-tools: Read, Glob, Grep
---

# Generate Jest and React Testing Library Tests

Generate comprehensive Jest tests for Node.js and Next.js applications following team conventions and best practices. Supports component tests, unit tests, integration tests, and async testing patterns.

This skill creates tests that cover happy path scenarios, edge cases, and error handling with proper mocking, user interactions, and accessibility-focused queries.

## When to Use

Use this skill when:
- Implementing new features that need test coverage
- Following TDD principles (write tests before implementation)
- Adding tests to existing components or utilities that lack coverage
- Ensuring consistent test patterns across the codebase
- Testing React components, custom hooks, API routes, or utility functions
- Testing Next.js pages, server components, or client components

## Arguments

Code to test: `$ARGUMENTS`

If a file path is provided, read it first.
If a component or module name is provided, find and read the relevant files.
If nothing provided, ask the user which code needs testing.

## Process

### Step 1: Read and analyze the code

Use Read, Glob, and Grep to:
- Read the target file(s) to understand structure
- Identify component props, state, hooks, and event handlers
- Identify function signatures, return types, and TypeScript types
- Find existing tests to match naming and style conventions
- Locate test setup files (jest.config.js, setupTests.ts) to understand available matchers
- Identify dependencies that need mocking (APIs, external libraries, context providers)

### Step 2: Identify test scenarios

For each component, function, or hook, categorize test cases:

**Happy path:**
- Normal successful execution
- Valid inputs producing expected outputs
- Standard user interactions and workflows
- Successful data fetching and rendering

**Edge cases:**
- Empty states (no data, empty arrays, empty strings)
- Loading states and skeleton screens
- Disabled or inactive states
- Single-item vs multiple-item scenarios
- Boundary conditions (min/max values, character limits)
- Missing optional props or parameters

**Error cases:**
- Invalid prop types or values
- Failed API calls or network errors
- Authentication/authorization failures
- Validation errors on user input
- Missing required props
- Error boundaries for component crashes

### Step 3: Generate the test file

Create a test file with this structure:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

// Mock external dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('ComponentName', () => {
  // Setup - runs before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Happy path tests
  it('renders the component with required props', () => {
    render(<ComponentName requiredProp="value" />);

    expect(screen.getByRole('heading', { name: /expected text/i })).toBeInTheDocument();
  });

  it('handles user interaction correctly', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<ComponentName onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: /click me/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Edge cases
  it('renders empty state when no data provided', () => {
    render(<ComponentName items={[]} />);

    expect(screen.getByText(/no items found/i)).toBeInTheDocument();
  });

  it('shows loading state while fetching data', () => {
    render(<ComponentName isLoading={true} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // Error handling
  it('displays error message on failed data fetch', async () => {
    const errorMessage = 'Failed to load data';

    render(<ComponentName error={errorMessage} />);

    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  // Async tests
  it('fetches and displays data on mount', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test data' }),
      })
    ) as jest.Mock;

    render(<ComponentName />);

    await waitFor(() => {
      expect(screen.getByText('test data')).toBeInTheDocument();
    });
  });
});
```

## Jest Conventions

### Test File Naming
- `*.test.ts`, `*.test.tsx` for test files
- `__tests__/*.ts`, `__tests__/*.tsx` for test directories
- Match the source file name: `Button.tsx` → `Button.test.tsx`
- Place in `__tests__` directory or alongside source file
- Use `.test.tsx` for component tests, `.test.ts` for utility tests

### Test Block Structure
- `describe` blocks for grouping related tests
- `it` or `test` for individual test cases
- Descriptive test names that read like sentences
- Nested `describe` blocks for sub-features or contexts

Example:
```typescript
describe('LoginForm', () => {
  describe('when user is not authenticated', () => {
    it('displays login fields', () => {
      // test
    });
  });

  describe('when form is submitted', () => {
    it('validates required fields', () => {
      // test
    });
  });
});
```

### Setup and Teardown
- `beforeEach` - Runs before each test (most common)
- `afterEach` - Runs after each test (cleanup)
- `beforeAll` - Runs once before all tests in describe block
- `afterAll` - Runs once after all tests in describe block

```typescript
describe('Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // RTL cleanup if needed
  });
});
```

### Assertions
- `expect(value).toBe(expected)` - Strict equality (===)
- `expect(value).toEqual(expected)` - Deep equality for objects/arrays
- `expect(value).toBeTruthy()` / `toBeFalsy()` - Boolean checks
- `expect(value).toBeNull()` / `toBeUndefined()` - Null/undefined checks
- `expect(value).toContain(item)` - Array or string contains
- `expect(fn).toHaveBeenCalled()` - Mock function was called
- `expect(fn).toHaveBeenCalledWith(args)` - Mock called with specific args
- `expect(fn).toHaveBeenCalledTimes(n)` - Mock called exact number of times

## React Testing Library Patterns

### Query Priority (use in this order)

1. **Accessible queries (prefer these):**
   - `getByRole` - Query by ARIA role (button, heading, textbox, etc.)
   - `getByLabelText` - Query by form label text
   - `getByPlaceholderText` - Query by input placeholder
   - `getByText` - Query by element text content
   - `getByDisplayValue` - Query by form element current value

2. **Semantic queries:**
   - `getByAltText` - Query by img alt attribute
   - `getByTitle` - Query by title attribute

3. **Test IDs (escape hatch only):**
   - `getByTestId` - Query by data-testid attribute (use sparingly)

### Query Variants

- `getBy*` - Returns element, throws if not found (use for elements that should exist)
- `queryBy*` - Returns element or null, doesn't throw (use for asserting non-existence)
- `findBy*` - Returns promise, waits for element to appear (use for async elements)

Example:
```typescript
// Element should exist
expect(screen.getByRole('button')).toBeInTheDocument();

// Element should not exist
expect(screen.queryByRole('alert')).not.toBeInTheDocument();

// Wait for async element
const heading = await screen.findByRole('heading');
expect(heading).toHaveTextContent('Loaded');
```

### User Interactions (prefer userEvent)

Always use `userEvent` over `fireEvent` for more realistic interactions:

```typescript
import userEvent from '@testing-library/user-event';

it('handles user input correctly', async () => {
  const user = userEvent.setup();

  render(<LoginForm />);

  // Type in input fields
  await user.type(screen.getByLabelText(/email/i), 'user@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');

  // Click button
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Other interactions
  await user.hover(screen.getByRole('button'));
  await user.tab(); // Tab navigation
  await user.keyboard('{Enter}'); // Keyboard events
  await user.clear(screen.getByLabelText(/email/i)); // Clear input
});
```

Why `userEvent` over `fireEvent`:
- Simulates full interactions (multiple events)
- Includes visibility and interactability checks
- More accurately represents real user behavior
- Supports keyboard navigation and accessibility features

### RTL Custom Matchers

Using `@testing-library/jest-dom`:

```typescript
// Element presence
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeEmptyDOMElement();

// Element state
expect(button).toBeDisabled();
expect(button).toBeEnabled();
expect(checkbox).toBeChecked();
expect(input).toHaveFocus();

// Content
expect(element).toHaveTextContent('expected text');
expect(element).toHaveValue('input value');
expect(link).toHaveAttribute('href', '/path');
expect(element).toHaveClass('active');

// Accessibility
expect(element).toHaveAccessibleName('Button Label');
expect(element).toHaveAccessibleDescription('Description text');
```

### Async Testing

```typescript
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';

// Wait for element to appear
const element = await screen.findByText('Loaded');

// Wait for condition
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// Wait for element to be removed
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

// Custom timeout
await waitFor(() => expect(mockFn).toHaveBeenCalled(), { timeout: 3000 });
```

## Mocking Patterns

### External Dependencies

```typescript
// Mock entire module
jest.mock('next/navigation');
jest.mock('@/lib/api');

// Mock specific functions
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/current-path'),
}));

// Restore original implementation
jest.unmock('module-name');
```

### API Calls and Fetch

```typescript
// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
  })
) as jest.Mock;

// Mock for specific test
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('fetches data successfully', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ users: ['Alice', 'Bob'] }),
  });

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  expect(global.fetch).toHaveBeenCalledWith('/api/users');
});

// Mock fetch failure
it('handles fetch error', async () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(
    new Error('Network error')
  );

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### React Context

```typescript
import { ThemeContext } from '@/contexts/ThemeContext';

it('uses theme from context', () => {
  render(
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      <Component />
    </ThemeContext.Provider>
  );

  expect(screen.getByTestId('theme-indicator')).toHaveTextContent('dark');
});
```

### Next.js Router

```typescript
import { useRouter, usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

it('navigates on button click', async () => {
  const pushMock = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({
    push: pushMock,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  });

  const user = userEvent.setup();
  render(<NavigationButton />);

  await user.click(screen.getByRole('button', { name: /next/i }));

  expect(pushMock).toHaveBeenCalledWith('/next-page');
});
```

### Custom Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

it('returns initial state', () => {
  const { result } = renderHook(() => useCustomHook());

  expect(result.current.value).toBe(initialValue);
});

it('updates state on action', async () => {
  const { result } = renderHook(() => useCustomHook());

  act(() => {
    result.current.updateValue('new value');
  });

  await waitFor(() => {
    expect(result.current.value).toBe('new value');
  });
});
```

### Spying on Functions

```typescript
// Spy on console methods
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

// Spy on object methods
const mockObj = {
  method: jest.fn(),
};

jest.spyOn(mockObj, 'method');
```

## Next.js Testing Patterns

### Testing Pages

```typescript
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('HomePage', () => {
  it('renders the page content', () => {
    render(<HomePage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
  });
});
```

### Testing Server Components

Note: Async Server Components are not fully supported in Jest yet. Test synchronous logic only or use E2E tests for async server components.

```typescript
// For synchronous server components
import ServerComponent from '@/components/ServerComponent';

it('renders server component', () => {
  render(<ServerComponent data={{ title: 'Test' }} />);

  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Testing API Routes (Next.js App Router)

```typescript
import { GET, POST } from '@/app/api/users/route';
import { NextRequest } from 'next/server';

describe('GET /api/users', () => {
  it('returns users list', async () => {
    const request = new NextRequest('http://localhost:3000/api/users');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toBeDefined();
    expect(Array.isArray(data.users)).toBe(true);
  });
});

describe('POST /api/users', () => {
  it('creates a new user', async () => {
    const userData = { name: 'Alice', email: 'alice@example.com' };
    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user.name).toBe('Alice');
  });

  it('returns 400 for invalid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: '' }), // Invalid: missing email
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

### Testing with Next.js Image

```typescript
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

it('renders image with correct src', () => {
  render(<ImageComponent src="/test.jpg" alt="Test" />);

  const img = screen.getByRole('img', { name: /test/i });
  expect(img).toHaveAttribute('src', '/test.jpg');
});
```

### Testing with Next.js Link

```typescript
import Link from 'next/link';

it('renders link with correct href', () => {
  render(
    <Link href="/about">
      <a>About Us</a>
    </Link>
  );

  const link = screen.getByRole('link', { name: /about us/i });
  expect(link).toHaveAttribute('href', '/about');
});
```

## Test Organization

### File Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   └── Form/
│       ├── Form.tsx
│       └── __tests__/
│           ├── Form.test.tsx
│           └── Form.integration.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
└── utils/
    ├── validation.ts
    └── validation.test.ts
```

### Grouping with describe

```typescript
describe('UserProfile', () => {
  describe('Rendering', () => {
    it('renders user information', () => {});
    it('renders avatar image', () => {});
  });

  describe('Interactions', () => {
    it('opens edit modal on edit button click', () => {});
    it('saves changes on form submit', () => {});
  });

  describe('Edge Cases', () => {
    it('handles missing avatar gracefully', () => {});
    it('displays placeholder for empty bio', () => {});
  });

  describe('Error Handling', () => {
    it('shows error message on save failure', () => {});
  });
});
```

### Test Data Factories

```typescript
// test-utils/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

export const createMockPost = (overrides = {}) => ({
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  authorId: '1',
  ...overrides,
});

// In tests
const user = createMockUser({ name: 'Alice' });
const post = createMockPost({ authorId: user.id });
```

## TypeScript Testing Patterns

### Typed Mock Functions

```typescript
import { jest } from '@jest/globals';

type MockFn<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

const mockFetch: MockFn<typeof fetch> = jest.fn();

// Or inline
const handleSubmit = jest.fn<void, [FormData]>();
```

### Testing with Generic Types

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
}

function createApiResponse<T>(data: T): ApiResponse<T> {
  return { data, status: 200 };
}

it('handles generic response type', () => {
  const response = createApiResponse({ userId: 1 });
  expect(response.data.userId).toBe(1);
});
```

## Coverage Guidelines

Aim for meaningful coverage:

- **Critical user flows:** 100% coverage for auth, payments, data submission
- **UI components:** Focus on user interactions and state changes, not implementation
- **Utilities and helpers:** 100% coverage for pure functions
- **Error boundaries:** Test error states and recovery
- **Accessibility:** Test keyboard navigation and screen reader support

Don't over-test:
- Skip testing third-party libraries (they have their own tests)
- Don't test implementation details (internal state, private methods)
- Don't test styling or CSS-in-JS unless behavior depends on it
- Don't duplicate tests that already exist

## Quality Checklist

A good test suite should:
- [ ] Cover happy path, edge cases, and error scenarios
- [ ] Use accessibility-focused queries (getByRole, getByLabelText)
- [ ] Prefer userEvent over fireEvent for interactions
- [ ] Test behavior, not implementation details
- [ ] Mock external dependencies (APIs, navigation, context)
- [ ] Use waitFor for async operations
- [ ] Have descriptive test and describe block names
- [ ] Follow arrange-act-assert pattern
- [ ] Be isolated (no dependencies between tests)
- [ ] Clean up after each test (mocks, timers, DOM)
- [ ] Run quickly (mock slow operations)
- [ ] Be deterministic (same result every time)

Avoid:
- Testing internal component state directly
- Testing implementation details that could change with refactoring
- Using queryByTestId unless absolutely necessary
- Over-mocking (mock what you must, not what you can)
- Complex test setup that obscures test intent
- Tests that depend on execution order
- Vague assertions like `expect(result).toBeTruthy()`
- Testing third-party library behavior

## TDD Workflow

When following Test-Driven Development:

1. **Write the test first** - Define expected behavior through tests
2. **Run the test** - Verify it fails with expected error (red)
3. **Write minimal code** - Make the test pass (green)
4. **Refactor** - Improve code while keeping tests green
5. **Repeat** - Add next test case

This skill supports TDD by generating test scaffolding before implementation exists.

## Example: Complete Component Test

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { useRouter } = require('next/navigation');
    useRouter.mockReturnValue({ push: mockPush });
  });

  // Happy Path
  describe('Happy Path', () => {
    it('renders login form with all fields', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('submits form with valid credentials', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValueOnce({ success: true });

      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'password123',
        });
      });
    });

    it('redirects to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValueOnce({ success: true });

      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('disables submit button while form is submitting', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /log in/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it('shows loading indicator during submission', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /log in/i }));

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('allows password visibility toggle', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(screen.getByRole('button', { name: /show password/i }));

      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('shows validation error for empty email', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /log in/i }));

      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /log in/i }));

      expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error message on login failure', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValueOnce(new Error('Invalid credentials'));

      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /log in/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/invalid credentials/i);
    });

    it('re-enables form after error', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValueOnce(new Error('Server error'));

      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /log in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(submitButton).toBeEnabled();
    });
  });

  // Accessibility
  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('announces errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole('button', { name: /log in/i }));

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveAccessibleName(/error/i);
    });
  });
});
```

## Output Format

Generate a complete test file with:

1. **Imports** - All necessary testing libraries, mocks, and code under test
2. **Mock setup** - Mock external dependencies at the top
3. **describe blocks** - Organized by feature or scenario
4. **beforeEach/afterEach** - Setup and cleanup
5. **Test cases** - Following arrange-act-assert pattern
6. **Comments** - Clear explanations where complexity requires it

## Sources

This skill is based on research and best practices from:
- [Testing in 2026: Jest, React Testing Library, and Full Stack Testing Strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies)
- [React Testing Library | Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [How to Test React Components with React Testing Library](https://oneuptime.com/blog/post/2026-02-20-react-testing-library-guide/view)
- [JavaScript Testing Complete Guide 2026: Vitest, Jest, Testing Library](https://calmops.com/programming/javascript/javascript-testing-guide-2026/)
- [Testing: Jest | Next.js](https://nextjs.org/docs/pages/guides/testing/jest)
- [Next.js Unit Testing Guide: Complete Jest + React Testing Library Setup](https://eastondev.com/blog/en/posts/dev/20260107-nextjs-jest-testing-guide/)
- [Introduction | Testing Library - userEvent](https://testing-library.com/docs/user-event/intro/)
- [React Testing Library best practices | Ben Ilegbodu](https://www.benmvp.com/blog/react-testing-library-best-practices/)
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
