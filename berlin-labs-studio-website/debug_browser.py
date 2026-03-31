from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()

    # Capture console logs
    console_logs = []
    def handle_console(msg):
        log_entry = {
            'type': msg.type,
            'text': msg.text,
            'location': f"{msg.location.get('url', '')}:{msg.location.get('lineNumber', '')}" if msg.location else ''
        }
        console_logs.append(log_entry)
        print(f"[{msg.type}] {msg.text}")

    page.on("console", handle_console)

    # Capture page errors
    page_errors = []
    def handle_page_error(error):
        page_errors.append(str(error))
        print(f"[PAGE ERROR] {error}")

    page.on("pageerror", handle_page_error)

    # Navigate to page
    print("Navigating to http://localhost:3001/")
    page.goto('http://localhost:3001/')

    # Wait for page to stabilize
    page.wait_for_load_state('networkidle', timeout=10000)
    page.wait_for_timeout(3000)

    # Take screenshot
    screenshot_path = '/tmp/berlinlabs_debug.png'
    page.screenshot(path=screenshot_path, full_page=True)
    print(f"\nScreenshot saved to: {screenshot_path}")

    # Check root element
    try:
        root = page.locator('#root')
        root_html = page.evaluate('el => el.innerHTML', root.element_handle())
        root_text = root.inner_text()

        print("\n" + "="*60)
        print("ROOT DIV CONTENT")
        print("="*60)
        print(f"HTML length: {len(root_html)} chars")
        print(f"Text content: {root_text[:200] if root_text else 'EMPTY'}")
        print("="*60)
    except Exception as e:
        print(f"Error accessing root: {e}")

    # Print all console logs
    print("\n" + "="*60)
    print("ALL CONSOLE LOGS")
    print("="*60)
    if not console_logs:
        print("No console logs captured")
    else:
        for log in console_logs:
            print(f"{log}")
    print("="*60)

    # Print page errors
    if page_errors:
        print("\n" + "="*60)
        print("PAGE ERRORS")
        print("="*60)
        for error in page_errors:
            print(error)
        print("="*60)

    # Keep browser open for manual inspection
    print("\nBrowser is open for manual inspection. Press Enter in terminal to close...")
    input()

    browser.close()
