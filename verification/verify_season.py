
from playwright.sync_api import sync_playwright, expect

def test_season_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Start on Home
            page.goto("http://localhost:5173/")

            # 2. Go to Season Dashboard
            page.get_by_role("link", name="Season Dashboard").click()
            expect(page).to_have_url("http://localhost:5173/season")

            # 3. Start New Season
            page.get_by_role("button", name="Start New Season").click()

            # 4. Sim a week
            page.get_by_role("button", name="Sim Week").click()

            # Verify week counter updated
            expect(page.get_by_text("Week: 2 / 12")).to_be_visible()

            # 5. Check scores in the list (verify non-empty)
            # The list items should contain "Final"
            # It might be in the unordered list
            # Wait for it
            expect(page.locator("li").filter(has_text="Final").first).to_be_visible()

            # 6. Go to Current Week View
            # This link is dynamic "Go to Current Week View"
            page.get_by_role("link", name="Go to Current Week View").click()

            # 7. Sort by Score (to verify the fix)
            # The URL might be /season/week/1
            expect(page).to_have_url("http://localhost:5173/season/week/1")

            page.get_by_label("Sort").select_option("score") # value is 'score'

            # Verify no crash and table still visible
            expect(page.locator("table")).to_be_visible()

            # 8. Go to Standings
            page.get_by_role("link", name="Standings", exact=True).click() # Link in nav

            # Verify standings table populated
            expect(page.locator("table").nth(0)).to_be_visible() # Conference Standings
            expect(page.locator("table").nth(1)).to_be_visible() # Overall Standings

            # Check for a record like "1-0" or "0-1" in Overall Standings
            # Just ensure rows exist
            expect(page.locator("table").nth(1).locator("tr").nth(1)).to_be_visible()

            page.screenshot(path="verification/season_flow.png", full_page=True)
            print("Season flow verification passed.")

        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/season_failure.png", full_page=True)
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    test_season_flow()
