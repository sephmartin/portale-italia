#!/usr/bin/env python3
"""Record a ~30s mobile demo video of Portale Italia — iPhone view."""
import asyncio, glob, shutil
from playwright.async_api import async_playwright

URL = "https://portale-italia.online"
OUTPUT = "/home/ubuntu/portale-italia-src/demo-mobile.mp4"
W, H = 393, 852  # iPhone 14 Pro

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": W, "height": H},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            record_video_dir="/tmp/pv2/",
            record_video_size={"width": W, "height": H}
        )
        pg = await ctx.new_page()

        # 1. Hub
        print("1. Hub...")
        await pg.goto(URL, wait_until="networkidle", timeout=30000)
        await pg.wait_for_timeout(2500)

        # 2. Scroll hub
        print("2. Scroll...")
        await pg.evaluate("window.scrollTo(0, 500)")
        await pg.wait_for_timeout(1500)

        # 3. Click AgentWidget button
        print("3. Open AI Assistant...")
        btn = pg.locator('[data-testid="agent-open-btn"]')
        if await btn.count() > 0:
            await btn.scroll_into_view_if_needed()
            await btn.click()
            await pg.wait_for_timeout(1500)
        else:
            print("   agent-open-btn not found, trying text match...")
            alt = pg.locator("text=Chiedi all'assistente")
            if await alt.count() > 0:
                await alt.click()
                await pg.wait_for_timeout(1500)

        await pg.screenshot(path="/tmp/pv2-chat-open.png")

        # 4. Click a suggestion
        print("4. Click suggestion...")
        sugg = pg.locator("text=Voglio fare il 730")
        if await sugg.count() > 0:
            await sugg.click()
            await pg.wait_for_timeout(4000)  # wait for response
        await pg.screenshot(path="/tmp/pv2-chat-msg.png")

        # 5. Scroll back up, navigate to dashboard
        print("5. Dashboard...")
        await pg.evaluate("window.scrollTo(0, 0)")
        await pg.wait_for_timeout(500)
        dash = pg.locator('[data-testid="nav-dashboard"]')
        if await dash.count() > 0:
            await dash.scroll_into_view_if_needed()
            await dash.click()
        else:
            await pg.goto(f"{URL}/#/dashboard", wait_until="networkidle", timeout=15000)
        await pg.wait_for_timeout(2500)

        # 6. Scroll dashboard
        print("6. Scroll dashboard...")
        await pg.evaluate("window.scrollTo(0, 400)")
        await pg.wait_for_timeout(1500)
        await pg.evaluate("window.scrollTo(0, 800)")
        await pg.wait_for_timeout(1500)

        await pg.wait_for_timeout(1000)

        print("7. Done, closing...")
        await ctx.close()
        await browser.close()

        videos = glob.glob("/tmp/pv2/*.webm")
        if videos:
            shutil.move(videos[0], OUTPUT)
            print(f"✅ Saved: {OUTPUT}")
        else:
            print("❌ No video")

asyncio.run(main())
