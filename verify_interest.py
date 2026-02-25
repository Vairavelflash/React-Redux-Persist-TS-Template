from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # 1. Setup
    page.goto("http://localhost:4173/career/setup")
    page.fill('input[placeholder="Avery Stone"]', "Test Coach")
    page.fill('input[placeholder="Bay State"]', "Test U")
    page.select_option('select:has-text("Select a team")', index=1)
    page.click('button[type="submit"]')
    page.wait_for_url("**/career")

    # 2. Add Recruit
    page.click('button:has-text("Generate Recruiting Class")')
    page.wait_for_selector("table")

    # Click Add
    page.click('button:has-text("Add")')

    # Verify Initial Interest is visible in Board Table
    # Just snapshot
    page.screenshot(path="verify_interest_initial.png")

    # 3. Set Hours and Pitch
    # Find input for hours (it's in the board table)
    page.fill('input[type="number"]', "10")

    # Set Pitch
    page.select_option('select:has-text("None")', index=1)

    # 4. Advance Week
    page.click('button:has-text("Advance Recruiting Week")')

    # 5. Verify Change
    # Wait a moment for update
    page.wait_for_timeout(500)
    page.screenshot(path="verify_interest_change.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
