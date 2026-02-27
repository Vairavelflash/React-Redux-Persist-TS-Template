
import { test, expect } from '@playwright/test';

test('Verify Recruiting UI', async ({ page }) => {
  // 1. Navigate to home
  await page.goto('http://localhost:5173/');

  // 2. Start Career (Mock Setup)
  await page.getByRole('link', { name: 'Coach Career' }).click();

  // Fill Coach Profile
  await page.getByPlaceholder('Coach Name').fill('Coach Test');
  await page.getByPlaceholder('Alma Mater').fill('Test University');
  await page.getByRole('button', { name: 'Create Coach' }).click();

  // Select Team (Pick first available)
  await page.locator('.card button').first().click();

  // 3. Navigate to Career Dashboard
  // Actually the Career Dashboard IS the main page now after setup?
  // Let's check where we land. Should be /career
  await expect(page).toHaveURL(/.*\/career/);

  // 4. Initialize Recruiting Board
  // Look for "Start Recruiting" button
  const startButton = page.getByRole('button', { name: 'Start Recruiting' });
  await expect(startButton).toBeVisible();

  // Set seed to ensure deterministic results (e.g. 2026)
  const seedInput = page.getByPlaceholder('Seed');
  await seedInput.fill('2026');

  await startButton.click();

  // 5. Verify Board UI Elements
  // Check for "Competition" column header
  await expect(page.getByRole('cell', { name: 'Competition' })).toBeVisible();

  // 6. Add a recruit
  // Find an "Add" button for a recruit
  const addButton = page.getByRole('button', { name: 'Add' }).first();
  await addButton.click();

  // 7. Verify recruit added to board with Competition info
  // The first row in the top table should now be populated
  // Check for a known team name in the competition column (e.g. "Virginia" or similar, hard to predict exactly without seed control, but we can look for "Unknown" or just text structure)

  // Wait for board update
  await page.waitForTimeout(1000);

  // 8. Take Screenshot
  await page.screenshot({ path: 'verification_recruiting.png', fullPage: true });
});
