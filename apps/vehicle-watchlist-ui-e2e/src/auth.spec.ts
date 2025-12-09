import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
    const uniqueEmail = () => `test.${Date.now()}@example.com`;
    const validPassword = 'Test1234';

    test.beforeEach(async ({ page }) => {
        // Clear local storage before each test
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
    });

    test.describe('Registration Flow', () => {
        test('should successfully register a new user', async ({ page }) => {
            const email = uniqueEmail();
            await page.goto('/register');

            // Fill registration form
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);

            // Submit form
            await page.click('button[type="submit"]');

            // Should redirect to dashboard
            await expect(page).toHaveURL('/dashboard');

            // Should show success toast (wait for it to appear)
            await expect(page.locator('text=Account created successfully!')).toBeVisible({ timeout: 5000 });
        });

        test('should show validation error for short name', async ({ page }) => {
            await page.goto('/register');

            await page.fill('input[id="name"]', 'A');
            await page.fill('input[id="email"]', 'test@example.com');
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);

            await page.click('button[type="submit"]');

            // Should show error message
            await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();

            // Should not redirect
            await expect(page).toHaveURL('/register');
        });

        test('should show validation error for invalid email', async ({ page }) => {
            await page.goto('/register');

            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', 'invalid-email');
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);

            await page.click('button[type="submit"]');

            await expect(page.locator('text=Invalid email address')).toBeVisible();
            await expect(page).toHaveURL('/register');
        });

        test('should show validation error for short password', async ({ page }) => {
            await page.goto('/register');

            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', uniqueEmail());
            await page.fill('input[id="password"]', 'short');
            await page.fill('input[id="confirmPassword"]', 'short');

            await page.click('button[type="submit"]');

            await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
            await expect(page).toHaveURL('/register');
        });

        test('should show validation error for password without uppercase', async ({ page }) => {
            await page.goto('/register');

            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', uniqueEmail());
            await page.fill('input[id="password"]', 'test1234');
            await page.fill('input[id="confirmPassword"]', 'test1234');

            await page.click('button[type="submit"]');

            await expect(page.locator('text=Password must contain at least one uppercase letter')).toBeVisible();
            await expect(page).toHaveURL('/register');
        });

        test('should show validation error for password without number', async ({ page }) => {
            await page.goto('/register');

            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', uniqueEmail());
            await page.fill('input[id="password"]', 'TestTest');
            await page.fill('input[id="confirmPassword"]', 'TestTest');

            await page.click('button[type="submit"]');

            await expect(page.locator('text=Password must contain at least one number')).toBeVisible();
            await expect(page).toHaveURL('/register');
        });

        test('should show validation error for password mismatch', async ({ page }) => {
            await page.goto('/register');

            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', uniqueEmail());
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', 'Different1234');

            await page.click('button[type="submit"]');

            await expect(page.locator('text=Passwords do not match')).toBeVisible();
            await expect(page).toHaveURL('/register');
        });

        test('should show error for duplicate email', async ({ page }) => {
            const email = uniqueEmail();

            // First registration
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User 1');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Logout
            await page.click('button:has-text("Logout")');
            await expect(page).toHaveURL('/login');

            // Try to register again with same email
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User 2');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');

            // Should show error toast
            await expect(page.locator('text=/email already exists/i')).toBeVisible({ timeout: 5000 });
            await expect(page).toHaveURL('/register');
        });

        test('should navigate to login page from register', async ({ page }) => {
            await page.goto('/register');

            await page.click('a:has-text("Sign in")');

            await expect(page).toHaveURL('/login');
        });
    });

    test.describe('Login Flow', () => {
        test('should successfully login with valid credentials', async ({ page }) => {
            const email = uniqueEmail();

            // First register a user
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Logout
            await page.click('button:has-text("Logout")');
            await expect(page).toHaveURL('/login');

            // Now login
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.click('button[type="submit"]');

            // Should redirect to dashboard
            await expect(page).toHaveURL('/dashboard');
            await expect(page.locator('text=Welcome back!')).toBeVisible({ timeout: 5000 });
        });

        test('should show validation error for invalid email format', async ({ page }) => {
            await page.goto('/login');

            await page.fill('input[id="email"]', 'invalid-email');
            await page.fill('input[id="password"]', validPassword);
            await page.click('button[type="submit"]');

            await expect(page.locator('text=Invalid email address')).toBeVisible();
            await expect(page).toHaveURL('/login');
        });

        test('should show validation error for missing password', async ({ page }) => {
            await page.goto('/login');

            await page.fill('input[id="email"]', 'test@example.com');
            await page.click('button[type="submit"]');

            await expect(page.locator('text=Password is required')).toBeVisible();
            await expect(page).toHaveURL('/login');
        });

        test('should show error for incorrect credentials', async ({ page }) => {
            await page.goto('/login');

            await page.fill('input[id="email"]', 'nonexistent@example.com');
            await page.fill('input[id="password"]', validPassword);
            await page.click('button[type="submit"]');

            // Should show error toast
            await expect(page.locator('text=/invalid credentials/i')).toBeVisible({ timeout: 10000 });
            await expect(page).toHaveURL('/login');
        });

        test('should navigate to register page from login', async ({ page }) => {
            await page.goto('/login');

            await page.click('a:has-text("Sign up")');

            await expect(page).toHaveURL('/register');
        });

        test('should disable form while submitting', async ({ page }) => {
            await page.goto('/login');

            await page.fill('input[id="email"]', 'test@example.com');
            await page.fill('input[id="password"]', validPassword);

            // Click submit and immediately check if button is disabled
            const submitButton = page.locator('button[type="submit"]');
            await submitButton.click();

            // Button should be disabled while processing
            await expect(submitButton).toBeDisabled();
        });
    });

    test.describe('Logout Flow', () => {
        test('should successfully logout and clear tokens', async ({ page }) => {
            const email = uniqueEmail();

            // Register and login
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Verify tokens are stored
            const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
            expect(accessToken).toBeTruthy();

            // Logout
            await page.click('button:has-text("Logout")');
            await expect(page).toHaveURL('/login');

            // Verify tokens are cleared
            const accessTokenAfterLogout = await page.evaluate(() => localStorage.getItem('access_token'));
            expect(accessTokenAfterLogout).toBeNull();
        });

        test('should show logged out toast message', async ({ page }) => {
            const email = uniqueEmail();

            // Register and login
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Logout
            await page.click('button:has-text("Logout")');

            // Should show success toast
            await expect(page.locator('text=Logged out successfully')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Protected Routes', () => {
        test('should redirect to login when accessing dashboard without authentication', async ({ page }) => {
            await page.goto('/dashboard');

            // Should redirect to home page
            await expect(page).toHaveURL('/');
        });

        test('should allow access to dashboard when authenticated', async ({ page }) => {
            const email = uniqueEmail();

            // Register a user
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');

            // Should access dashboard
            await expect(page).toHaveURL('/dashboard');

            // Verify we can see authenticated content
            await expect(page.locator('button:has-text("Logout")')).toBeVisible();
        });

        test('should redirect to dashboard when accessing login while authenticated', async ({ page }) => {
            const email = uniqueEmail();

            // Register a user
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Try to access login page
            await page.goto('/login');

            // Should redirect back to dashboard
            await expect(page).toHaveURL('/dashboard');
        });
    });

    test.describe('Navigation', () => {
        test('should show correct navbar when not authenticated', async ({ page }) => {
            await page.goto('/');

            // Should show login and register links
            await expect(page.locator('a:has-text("Login")')).toBeVisible();
            await expect(page.locator('a:has-text("Register")')).toBeVisible();

            // Should not show logout button
            await expect(page.locator('button:has-text("Logout")')).toBeHidden();
        });

        test('should show correct navbar when authenticated', async ({ page }) => {
            const email = uniqueEmail();

            // Register a user
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Should show logout button
            await expect(page.locator('button:has-text("Logout")')).toBeVisible();

            // Should not show login/register links
            await expect(page.locator('a:has-text("Login")')).toBeHidden();
            await expect(page.locator('a:has-text("Register")')).toBeHidden();
        });

        test('should update navbar after login', async ({ page }) => {
            const email = uniqueEmail();

            // Register a user
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Logout
            await page.click('button:has-text("Logout")');
            await expect(page).toHaveURL('/login');

            // Verify navbar shows login/register
            await expect(page.locator('a:has-text("Login")')).toBeVisible();
            await expect(page.locator('a:has-text("Register")')).toBeVisible();

            // Login
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Navbar should update to show logout
            await expect(page.locator('button:has-text("Logout")')).toBeVisible();
            await expect(page.locator('a:has-text("Login")')).toBeHidden();
        });
    });

    test.describe('Form Field Interactions', () => {
        test('should clear error when user types in field', async ({ page }) => {
            await page.goto('/login');

            // Trigger validation error
            await page.fill('input[id="email"]', 'invalid');
            await page.click('button[type="submit"]');
            await expect(page.locator('text=Invalid email address')).toBeVisible();

            // Type in field
            await page.fill('input[id="email"]', 'test@example.com');

            // Error should be cleared
            await expect(page.locator('text=Invalid email address')).toBeHidden();
        });

        test('should show/hide password helper text', async ({ page }) => {
            await page.goto('/register');

            // Password helper text should be visible
            await expect(page.locator('text=Must be at least 8 characters with uppercase, lowercase, and number')).toBeVisible();
        });

        test('should handle special characters in email', async ({ page }) => {
            const email = `test+special.${Date.now()}@example.com`;

            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');

            // Should successfully register
            await expect(page).toHaveURL('/dashboard');
        });
    });

    test.describe('Session Persistence', () => {
        test('should maintain session across page reloads', async ({ page }) => {
            const email = uniqueEmail();

            // Register a user
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Reload page
            await page.reload();

            // Should still be on dashboard and authenticated
            await expect(page).toHaveURL('/dashboard');
            await expect(page.locator('button:has-text("Logout")')).toBeVisible();
        });

        test('should maintain session across navigation', async ({ page }) => {
            const email = uniqueEmail();

            // Register a user
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Navigate away and back
            await page.goto('/');
            await page.goto('/dashboard');

            // Should still be authenticated
            await expect(page).toHaveURL('/dashboard');
            await expect(page.locator('button:has-text("Logout")')).toBeVisible();
        });
    });

    test.describe('Edge Cases', () => {
        test('should handle email with whitespace', async ({ page }) => {
            const email = uniqueEmail();

            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', `  ${email}  `);
            await page.locator('input[id="email"]').blur();
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');

            // Should successfully register (frontend trims on blur)
            await expect(page).toHaveURL('/dashboard');
        });

        test('should handle mixed case email', async ({ page }) => {
            const baseEmail = uniqueEmail();
            const mixedCaseEmail = baseEmail.replace('test', 'TeSt');

            // Register with mixed case
            await page.goto('/register');
            await page.fill('input[id="name"]', 'Test User');
            await page.fill('input[id="email"]', mixedCaseEmail);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');
            await expect(page).toHaveURL('/dashboard');

            // Logout
            await page.click('button:has-text("Logout")');
            await expect(page).toHaveURL('/login');

            // Login with lowercase
            await page.fill('input[id="email"]', mixedCaseEmail.toLowerCase());
            await page.fill('input[id="password"]', validPassword);
            await page.click('button[type="submit"]');

            // Should successfully login
            await expect(page).toHaveURL('/dashboard');
        });

        test('should handle rapid form submissions', async ({ page }) => {
            await page.goto('/login');

            await page.fill('input[id="email"]', 'test@example.com');
            await page.fill('input[id="password"]', validPassword);

            // Click submit button once
            const submitButton = page.locator('button[type="submit"]');
            await submitButton.click();

            // Button should be disabled immediately to prevent double-submission
            await expect(submitButton).toBeDisabled();
        });

        test('should handle very long names', async ({ page }) => {
            const longName = 'A'.repeat(100);
            const email = uniqueEmail();

            await page.goto('/register');
            await page.fill('input[id="name"]', longName);
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', validPassword);
            await page.fill('input[id="confirmPassword"]', validPassword);
            await page.click('button[type="submit"]');

            // Should handle long names
            await expect(page).toHaveURL('/dashboard');
        });
    });
});
