#!/usr/bin/env python3
"""Record a ~25s mobile demo video of Portale Italia."""
import asyncio
from playwright.async_api import async_playwright

URL = "https://portale-italia.online"
OUTPUT = "/home/ubuntu/portale-italia-src/demo-mobile.mp4"

# iPhone 14 Pro viewport
MOBILE_WIDTH = 393
MOBILE_HEIGHT = 852

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        context = await browser.new_context(
            viewport={"width": MOBILE_WIDTH, "height": MOBILE_HEIGHT},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            record_video_dir="/tmp/portale-video/",
            record_video_size={"width": MOBILE_WIDTH, "height": MOBILE_HEIGHT}
        )
        
        page = await context.new_page()
        
        print("1. Loading Hub...")
        await page.goto(URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)  # let it render
        
        print("2. Screenshot Hub (for reference)")
        await page.screenshot(path="/tmp/portale-hub.png")
        
        # Scroll down to see more cards
        print("3. Scrolling Hub...")
        await page.evaluate("window.scrollTo(0, 400)")
        await page.wait_for_timeout(1500)
        
        print("4. Clicking Dashboard...")
        # Find and click the dashboard link/card
        try:
            # Try clicking by text or href
            dash_link = page.locator('a[href*="dashboard"]').first
            if await dash_link.count() > 0:
                await dash_link.click()
            else:
                # Fallback: navigate directly
                await page.goto(f"{URL}/#/dashboard", wait_until="networkidle", timeout=15000)
        except Exception as e:
            print(f"   Click failed, navigating directly: {e}")
            await page.goto(f"{URL}/#/dashboard", wait_until="networkidle", timeout=15000)
        
        await page.wait_for_timeout(2500)
        print("5. Dashboard loaded")
        await page.screenshot(path="/tmp/portale-dashboard.png")
        
        # Scroll dashboard to show data
        print("6. Scrolling Dashboard...")
        await page.evaluate("window.scrollTo(0, 300)")
        await page.wait_for_timeout(1500)
        await page.evaluate("window.scrollTo(0, 600)")
        await page.wait_for_timeout(1500)
        
        # Click on a notification if present
        print("7. Clicking notification...")
        try:
            notif = page.locator('text=INPS').first
            if await notif.count() > 0:
                await notif.click()
                await page.wait_for_timeout(2000)
        except:
            pass
        
        await page.screenshot(path="/tmp/portale-notif.png")
        
        # Go back to hub
        print("8. Back to Hub...")
        await page.goto(URL, wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1500)
        
        # Click AI assistant
        print("9. Opening AI Assistant...")
        try:
            ai_link = page.locator('a[href*="chat"], a[href*="ai"], a[href*="assistente"]').first
            if await ai_link.count() > 0:
                await ai_link.click()
                await page.wait_for_timeout(2000)
            else:
                await page.goto(f"{URL}/#/chat", wait_until="networkidle", timeout=15000)
        except:
            await page.goto(f"{URL}/#/chat", wait_until="networkidle", timeout=15000)
        
        await page.wait_for_timeout(2000)
        await page.screenshot(path="/tmp/portale-ai.png")
        
        # Final pause
        await page.wait_for_timeout(1000)
        
        print("10. Closing browser...")
        await context.close()
        await browser.close()
        
        # Find the recorded video
        import glob, shutil
        videos = glob.glob("/tmp/portale-video/*.webm")
        if videos:
            shutil.move(videos[0], OUTPUT)
            print(f"✅ Video saved: {OUTPUT}")
        else:
            print("❌ No video found")
        
        print("Done!")

asyncio.run(main())
