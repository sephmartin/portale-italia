#!/usr/bin/env python3
"""Record mobile demo — Portale Italia (~30s)."""
import asyncio, glob, shutil
from playwright.async_api import async_playwright

URL = "https://portale-italia.online"
OUT = "/home/ubuntu/portale-italia-src/demo-mobile.mp4"
W, H = 393, 852

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(
            viewport={"width": W, "height": H}, device_scale_factor=3,
            is_mobile=True, has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
            record_video_dir="/tmp/pv3/", record_video_size={"width": W, "height": H}
        )
        pg = await ctx.new_page()

        # ── SCENE 1: Hub ──
        print("Scene 1: Hub")
        await pg.goto(URL, wait_until="networkidle", timeout=30000)
        await pg.wait_for_timeout(3000)

        # Scroll to show service cards
        await pg.evaluate("window.scrollTo(0, 500)")
        await pg.wait_for_timeout(2000)

        # ── SCENE 2: Open AI Chat ──
        print("Scene 2: AI Chat")
        btn = pg.locator('[data-testid="agent-open-btn"]')
        if await btn.count() > 0:
            await btn.scroll_into_view_if_needed()
            await pg.wait_for_timeout(300)
            await btn.click()
            await pg.wait_for_timeout(1500)

        # Click suggestion
        sugg = pg.locator("text=Voglio fare il 730")
        if await sugg.count() > 0:
            await sugg.click()
            await pg.wait_for_timeout(5000)
        else:
            print("  Suggestion not found, typing manually...")
            inp = pg.locator('[data-testid="agent-input"]')
            if await inp.count() > 0:
                await inp.fill("Come faccio il 730?")
                await pg.keyboard.press("Enter")
                await pg.wait_for_timeout(5000)

        await pg.wait_for_timeout(1000)

        # ── SCENE 3: Navigate to Dashboard via notification bell ──
        print("Scene 3: Dashboard")
        # Click the bell icon in topbar (links to /dashboard)
        bell = pg.locator('header a[href*="dashboard"]')
        if await bell.count() > 0:
            await bell.click()
        else:
            await pg.goto(f"{URL}/#/dashboard", wait_until="networkidle", timeout=15000)
        await pg.wait_for_timeout(2500)

        # Scroll through dashboard
        await pg.evaluate("window.scrollTo(0, 300)")
        await pg.wait_for_timeout(1500)
        await pg.evaluate("window.scrollTo(0, 700)")
        await pg.wait_for_timeout(1500)
        await pg.evaluate("window.scrollTo(0, 0)")
        await pg.wait_for_timeout(1000)

        # ── SCENE 4: Click a notification ──
        print("Scene 4: Notification detail")
        notif = pg.locator('text=IMU').first
        if await notif.count() > 0:
            await notif.scroll_into_view_if_needed()
            await pg.wait_for_timeout(300)
            await notif.click()
            await pg.wait_for_timeout(2000)

        await pg.wait_for_timeout(1000)

        print("Done, closing...")
        await ctx.close()
        await b.close()

        vids = glob.glob("/tmp/pv3/*.webm")
        if vids:
            shutil.move(vids[0], OUT)
            print(f"✅ {OUT}")
        else:
            print("❌ No video")

asyncio.run(main())
