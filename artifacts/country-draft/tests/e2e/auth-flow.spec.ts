import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should display sign in modal and authenticate with test credentials', async ({ page }) => {
    // Go to the home page
    await page.goto('http://localhost:5173');

    // Wait for auth to resolve initially (could be Settings or Account if logged in from previous state, but Playwright is isolated)
    await expect(page.locator('button', { hasText: 'Settings' })).toBeVisible({ timeout: 10000 });

    // Click the Sign In button
    const signInButton = page.locator('button', { hasText: /Sign In/i }).first();
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    
    // Check if modal appears
    const modal = page.locator('div').filter({ hasText: 'Sign in to continue' }).first();
    await expect(modal).toBeVisible();
    
    // Click "Sign in with Email"
    const emailSignInBtn = page.locator('button', { hasText: /Sign in with Email/i });
    await expect(emailSignInBtn).toBeVisible();
    await emailSignInBtn.click();

    // Check for email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // Fill credentials
    await emailInput.fill('antigravity@test.com');
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Antigravity123!');

    // Click the final Sign In button
    const submitBtn = page.locator('button', { hasText: /^Sign In$/ }).last();
    await submitBtn.click();

    // Wait for authentication to complete
    // The top right button should now show "Antigravity" instead of "Settings"
    const accountBtn = page.locator('button', { hasText: 'Antigravity' });
    await expect(accountBtn).toBeVisible({ timeout: 15000 });
  });
});
