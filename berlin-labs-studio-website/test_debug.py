from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # Capture console logs
    console_messages = []
    def log_console(msg):
        text = msg.type + ": " + msg.text
        console_messages.append(text)
        print(text)

    page.on("console", log_console)

    # Navigate to the page
    page.goto('http://localhost:3001/', wait_until="networkidle")

    # Wait a bit for any async operations
    page.wait_for_timeout(3000)

    # Take screenshot
    page.screenshot(path='/tmp/berlinlabs_debug.png', full_page=True)

    # Get page content
    root_content = page.inner_text('#root') if page.locator('#root').count() > 0 else "ROOT NOT FOUND"

    print("\n" + "="*50)
    print("ROOT DIV CONTENT:")
    print("="*50)
    print(root_content if root_content else "EMPTY")
    print("="*50)

    print("\n" + "="*50)
    print("ALL CONSOLE MESSAGES:")
    print("="*50)
    for msg in console_messages:
        print(msg)
    print("="*50)

    # Keep browser open for inspection
    input("Press Enter to close browser...")
    browser.close()
