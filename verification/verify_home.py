from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)

    # Check if Login Screen button is present
    signin_button = page.get_by_role("button", name="Sign In to Play")
    if signin_button.is_visible():
        print("Login Screen 'Sign In to Play' button is visible")
    else:
        print("Login Screen 'Sign In to Play' button NOT visible")

    # Check if 'Easy Mode' button is NOT present (as we are logged out)
    easy_mode = page.get_by_text("Easy Mode")
    if not easy_mode.is_visible():
        print("Easy Mode button is NOT visible (correct)")
    else:
        print("Easy Mode button IS visible (incorrect when logged out)")

    # Take screenshot
    page.screenshot(path="verification/screenshots/home_logged_out.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
