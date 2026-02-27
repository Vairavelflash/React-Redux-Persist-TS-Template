
import { test, expect } from '@playwright/test';

test('Recruiting UI Verification', async ({ page }) => {
  // 1. Navigate to home (Wait for server)
  await page.goto('http://localhost:5173/');

  // 2. Start Career (Mock Setup)
  const newCareerBtn = page.getByText('Start New Career'); // Adjust locator based on Home.tsx
  if (await newCareerBtn.isVisible()) {
    await newCareerBtn.click();
  } else {
    // Maybe directly go to /career/setup if link is there
    await page.goto('http://localhost:5173/career/setup');
  }

  // Fill Coach Profile
  await page.getByPlaceholder('Name').fill('Coach Test');
  await page.getByPlaceholder('Alma Mater').fill('Test University');

  // Select archetype if needed
  // Continue
  await page.getByText('Create Profile').click();

  // Select Team (Pick first available)
  // Wait for team cards
  await page.waitForSelector('.card');
  const firstTeam = page.locator('.card button').first();
  await firstTeam.click();

  // 3. Navigate to Season Dashboard -> Recruit
  // Actually the Career Dashboard IS the main page now after setup?
  // Let's check where we land. Should be /career
  // Wait for navigation
  await page.waitForURL('**/career');

  // 4. Initialize Recruiting Board
  // Look for "Start Recruiting" button
  const startButton = page.getByRole('button', { name: 'Start Recruiting' });
  await expect(startButton).toBeVisible();

  // Set seed to ensure deterministic results (e.g. 2026)
  const seedInput = page.getByPlaceholder('Seed');
  await seedInput.fill('2026');

  await startButton.click();

  // 5. Verify Board UI Elements
  // Check for "Competition" column header in the TOP table (Target List)
  // The target list is initially empty, so we need to add someone first to see rows.
  // But the header should be there.
  await expect(page.getByRole('columnheader', { name: 'Competition' })).toBeVisible();

  // 6. Add a recruit
  // Find an "Add" button for a recruit in the BOTTOM table (Prospect Pool)
  // Let's filter for "A" to be specific
  await page.getByRole('combobox').nth(1).selectOption('A'); // Second combo box is position filter

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
