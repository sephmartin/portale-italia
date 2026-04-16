#!/usr/bin/env python3
"""Capture screenshots of key pages — mobile + desktop."""
import asyncio
from playwright.async_api import async_playwright

URL = "https://portale-italia.online"
PAGES = [
    ("/", "hub"),
    ("/dashboard", "dashboard"),
    ("/inps", "inps"),
    ("/entrate", "entrate"),
    ("/pagopa", "pagopa"),
    ("/salute", "salute"),
    ("/auto", "auto"),
    ("/anpr", "anpr"),
]

OUT = "/tmp/screenshots"
MOBILE = {"width": 393, "height": 852, "scale": 3}
DESKTOP = {"width": 1440, "height": 900, "scale": 2}

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for label, vp in [("mobile", MOBILE), ("desktop", DESKTOP)]:
            ctx = await browser.new_context(
                viewport={"width": vp["width"], "height": vp["height"]},
                device_scale_factor=vp["scale"],
                is_mobile=(label == "mobile"),
                has_touch=(label == "mobile"),
            )
            pg = await ctx.new_page()

            for path, name in PAGES:
                full = f"{URL}/#{path}" if path != "/" else URL
                print(f"  {label}/{name}...")
                try:
                    await pg.goto(full, wait_until="networkidle", timeout=20000)
                    await pg.wait_for_timeout(2000)
                    await pg.screenshot(
                        path=f"{OUT}/{label}_{name}.png",
                        full_page=True
                    )
                except Exception as e:
                    print(f"    FAILED: {e}")

            await ctx.close()

        await browser.close()
        print("Done!")

import os; os.makedirs(OUT, exist_ok=True)
asyncio.run(main())
