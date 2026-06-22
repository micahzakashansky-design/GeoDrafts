import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('should play a full normal game and submit score', async ({ page }) => {
    // 1. Go to the home page
    await page.goto('http://localhost:5173');

    // Wait for the auth init
    await expect(page.locator('button', { hasText: 'Settings' })).toBeVisible({ timeout: 10000 });

    // 2. Auth Flow
    const signInButton = page.locator('button', { hasText: /Sign In/i }).first();
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    
    const emailSignInBtn = page.locator('button', { hasText: /Sign in with Email/i });
    await expect(emailSignInBtn).toBeVisible();
    await emailSignInBtn.click();

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('antigravity@test.com');
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Antigravity123!');

    const submitBtn = page.locator('button', { hasText: /^Sign In$/ }).last();
    await submitBtn.click();

    // Verify logged in
    const accountBtn = page.locator('button', { hasText: 'Antigravity' });
    await expect(accountBtn).toBeVisible({ timeout: 15000 });

    // 3. Start a Normal game
    // The "Classic Draft" section has a button with text "Normal"
    const normalModeBtn = page.locator('button', { hasText: /Normal/ }).first();
    await expect(normalModeBtn).toBeVisible({ timeout: 5000 });
    await normalModeBtn.click();

    // 4. Play 15 rounds
    for (let i = 0; i < 15; i++) {
      // Wait for the CountryCard to render the categories grid and ensure count is correct
      await expect(page.locator('.cursor-pointer')).toHaveCount(15 - i, { timeout: 5000 });
      // Click the first available category to assign.
      const categoryCard = page.locator('.cursor-pointer').first();
      await categoryCard.click();
    }

    // 5. Game Over screen
    // Wait for the "Submit Score" button
    const submitScoreBtn = page.locator('button', { hasText: 'Submit Score' });
    await expect(submitScoreBtn).toBeVisible({ timeout: 5000 });
    await submitScoreBtn.click();

    // 6. SubmitDialog opens, click "Submit to Leaderboard"
    const submitToLeaderboardBtn = page.locator('button', { hasText: 'Submit to Leaderboard' });
    await expect(submitToLeaderboardBtn).toBeVisible({ timeout: 5000 });
    await submitToLeaderboardBtn.click();

    // 7. Verify success
    const successMsg = page.locator('div', { hasText: 'Score submitted!' }).first();
    await expect(successMsg).toBeVisible({ timeout: 10000 });
  });
});
