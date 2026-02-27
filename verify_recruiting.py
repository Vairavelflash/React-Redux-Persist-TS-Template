
import re

from playwright.sync_api import expect, sync_playwright

def test_recruiting_verification(page):
    print("Navigating to home...")
    page.goto("http://localhost:5173/")

    # Start Career
    print("Starting Career...")
    # Check for Start Career link or button
    try:
        page.get_by_role("link", name="Coach Career").click(timeout=2000)
    except Exception:
        page.goto("http://localhost:5173/career/setup")

    # Setup Page
    print("Filling Profile...")
    page.get_by_placeholder("Coach Name").fill("Verify Coach")
    page.get_by_placeholder("Alma Mater").fill("Verify U")

    # Archetype selection (default is fine, just click continue)
    page.get_by_role("button", name="Create Coach Profile").click()

    # Team Selection
    print("Selecting Team...")
    # Wait for cards
    page.wait_for_selector(".card")
    # Click first select button
    page.locator(".card button").first.click()

    # Career Dashboard
    print("On Dashboard...")
    expect(page).to_have_url(re.compile(r".*/career$"))

    # Initialize Board
    print("Initializing Board...")
    seed_input = page.get_by_placeholder("Seed")
    seed_input.fill("2026")
    page.get_by_role("button", name="Start Recruiting").click()

    # Verify UI
    print("Verifying UI...")
    # Check for Competition Header in top table
    target_table = page.locator(".card").nth(1).get_by_role("table")
    expect(target_table.get_by_text("Competition")).to_be_visible()

    # Add a recruit
    print("Adding Recruit...")
    pool_table = page.locator(".card").nth(2).get_by_role("table")
    # Add first available
    pool_table.get_by_role("button", name="Add").first.click()

    # Verify Recruit in Target List
    print("Verifying Recruit Added...")
    expect(target_table.get_by_role("row")).to_have_count(2) # Header + 1 Row

    # Verify Competition Column Data
    print("Verifying Competition Data...")
    first_data_row = target_table.get_by_role("row").nth(1)
    comp_cell = first_data_row.get_by_role("cell").nth(1)
    expect(comp_cell).to_have_text(re.compile(r"\S+"))

    # Screenshot
    print("Taking Screenshot...")
    page.screenshot(path="verification_recruiting.png", full_page=True)
    print("Done!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_recruiting_verification(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="debug_screenshot.png", full_page=True)
        finally:
            browser.close()
