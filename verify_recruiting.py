import re
import traceback
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import expect, sync_playwright

BASE_URL = "http://localhost:5173"
VERIFICATION_SCREENSHOT = "verification_recruiting.png"
DEBUG_SCREENSHOT = "debug_screenshot.png"


def _save_screenshot(page, path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=path, full_page=True)


def _open_career_setup(page) -> None:
    print("Opening career setup...")
    page.goto(f"{BASE_URL}/")

    career_link = page.get_by_role("link", name="Coach Career")
    if career_link.count() > 0:
        career_link.first.click()
    else:
        page.goto(f"{BASE_URL}/career/setup")

    expect(page).to_have_url(re.compile(r".*/career/setup$"))


def _complete_career_setup(page) -> None:
    print("Completing setup form...")
    page.get_by_label("Coach Name").fill("Verify Coach")
    page.get_by_label("Alma Mater").fill("Verify U")

    program_select = page.get_by_label("Program")
    first_program_value = program_select.locator("option").nth(1).get_attribute("value")
    if not first_program_value:
        raise RuntimeError("No team options found in Program selector.")
    program_select.select_option(first_program_value)

    page.get_by_role("button", name=re.compile(r"Start Career|Update Career Setup")).click()
    expect(page).to_have_url(re.compile(r".*/career$"))


def _initialize_recruiting(page) -> None:
    print("Initializing recruiting board...")
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
    competition_cell = first_data_row.get_by_role("cell").nth(1)
    expect(competition_cell).to_have_text(re.compile(r"\S+"))


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
        except (AssertionError, RuntimeError, PlaywrightTimeoutError) as error:
            print(f"Verification failed: {error}")
            _save_screenshot(page, DEBUG_SCREENSHOT)
            traceback.print_exc()
            raise
        finally:
            browser.close()
