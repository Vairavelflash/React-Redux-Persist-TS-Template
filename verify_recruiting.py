import re
import traceback
from pathlib import Path

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
    expect(seed_input).to_be_visible()
    seed_input.fill("2026")

    start_button = page.get_by_role("button", name="Start Recruiting")
    expect(start_button).to_be_visible()
    start_button.click()


def _verify_board_and_add_recruit(page) -> None:
    print("Verifying board and adding recruit...")
    target_table = page.locator(".card").nth(1).get_by_role("table")
    expect(target_table.get_by_role("columnheader", name="Competition")).to_be_visible()

    pool_table = page.locator(".card").nth(2).get_by_role("table")
    pool_table.get_by_role("button", name="Add").first.click()

    expect(target_table.get_by_role("row")).to_have_count(2)

    first_data_row = target_table.get_by_role("row").nth(1)
    comp_cell = first_data_row.get_by_role("cell").nth(1)
    expect(comp_cell).to_have_text(re.compile(r"\S+"))

def test_recruiting_verification(page) -> None:
    _open_career_setup(page)
    _complete_career_setup(page)
    _initialize_recruiting(page)
    _verify_board_and_add_recruit(page)

    print("Taking verification screenshot...")
    _save_screenshot(page, VERIFICATION_SCREENSHOT)
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
