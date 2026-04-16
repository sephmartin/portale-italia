#!/usr/bin/env python3
"""Record smooth mobile demo with visible clicks and cursor."""
import asyncio, glob, shutil
from playwright.async_api import async_playwright

URL = "https://portale-italia.online"
OUT = "/home/ubuntu/portale-italia-src/demo-mobile.mp4"
W, H = 393, 852

CLICK_JS = """
(() => {
  const dot = document.createElement('div');
  dot.id = '__click_dot';
  Object.assign(dot.style, {
    position: 'fixed', width: '44px', height: '44px', borderRadius: '50%',
    border: '3px solid rgba(0,100,255,0.8)', background: 'rgba(0,100,255,0.15)',
    pointerEvents: 'none', zIndex: '99999', transition: 'all 0.15s ease',
    transform: 'translate(-50%,-50%) scale(0)', opacity: '0'
  });
  document.body.appendChild(dot);
  window.__showClick = (x, y) => {
    dot.style.left = x + 'px'; dot.style.top = y + 'px';
    dot.style.transform = 'translate(-50%,-50%) scale(1)'; dot.style.opacity = '1';
    setTimeout(() => { dot.style.transform = 'translate(-50%,-50%) scale(1.5)'; dot.style.opacity = '0'; }, 300);
  };
})();
"""

async def click_at(pg, selector, pause=1.2):
    """Click with visible indicator and smooth pause."""
    el = pg.locator(selector).first
    if await el.count() > 0:
        box = await el.bounding_box()
        if box:
            x, y = box['x'] + box['width']/2, box['y'] + box['height']/2
            await pg.evaluate(f"window.__showClick({x}, {y})")
            await pg.wait_for_timeout(200)
            await el.click()
            await pg.wait_for_timeout(int(pause * 1000))
            return True
    return False

async def scroll_smooth(pg, y_target, duration_ms=1500):
    """Smooth scroll to position."""
    await pg.evaluate(f"""
    (() => {{
      const start = window.scrollY;
      const dist = {y_target} - start;
      const dur = {duration_ms};
      const t0 = performance.now();
      function step(t) {{
        const p = Math.min((t - t0) / dur, 1);
        const ease = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
        window.scrollTo(0, start + dist * ease);
        if (p < 1) requestAnimationFrame(step);
      }}
      requestAnimationFrame(step);
    }})()""")
    await pg.wait_for_timeout(duration_ms + 200)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(
            viewport={"width": W, "height": H}, device_scale_factor=3,
            is_mobile=True, has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
            record_video_dir="/tmp/pv4/", record_video_size={"width": W, "height": H}
        )
        pg = await ctx.new_page()

        # Inject click indicator
        await pg.goto(URL, wait_until="networkidle", timeout=30000)
        await pg.evaluate(CLICK_JS)
        await pg.wait_for_timeout(2000)

        # ── SCENE 1: Hub ──
        print("Scene 1: Hub landing")
        await pg.wait_for_timeout(1500)

        # Smooth scroll to show cards
        await scroll_smooth(pg, 400, 1200)
        await pg.wait_for_timeout(1000)

        # Scroll back up
        await scroll_smooth(pg, 0, 1000)
        await pg.wait_for_timeout(800)

        # ── SCENE 2: Hamburger menu ──
        print("Scene 2: Hamburger menu")
        await click_at(pg, 'button[aria-label="Menu"]', pause=1.5)
        await pg.wait_for_timeout(1000)

        # Show menu open, then close by clicking overlay
        await click_at(pg, 'div.fixed.inset-0', pause=1.0)
        await pg.wait_for_timeout(500)

        # ── SCENE 3: Click a service card (INPS) ──
        print("Scene 3: INPS service")
        inps = pg.locator('a[href*="/inps"]').first
        if await inps.count() > 0:
            await inps.scroll_into_view_if_needed()
            await pg.wait_for_timeout(300)
            await click_at(pg, 'a[href*="/inps"]', pause=2.0)
        else:
            await pg.goto(f"{URL}/#/inps", wait_until="networkidle", timeout=15000)
            await pg.wait_for_timeout(2000)

        # Scroll INPS page
        await scroll_smooth(pg, 300, 1000)
        await pg.wait_for_timeout(1000)

        # ── SCENE 4: Back to Hub, go to Dashboard ──
        print("Scene 4: Dashboard via bell")
        # Use back or navigate
        await pg.goto(URL, wait_until="networkidle", timeout=15000)
        await pg.evaluate(CLICK_JS)
        await pg.wait_for_timeout(1000)

        # Click notification bell
        await click_at(pg, 'header a[href*="dashboard"]', pause=2.0)

        # Scroll dashboard
        await scroll_smooth(pg, 300, 1200)
        await pg.wait_for_timeout(800)
        await scroll_smooth(pg, 600, 1200)
        await pg.wait_for_timeout(800)
        await scroll_smooth(pg, 0, 1000)
        await pg.wait_for_timeout(500)

        # ── SCENE 5: Click notification ──
        print("Scene 5: Click notification")
        notif = pg.locator('text=Bollo auto').first
        if await notif.count() > 0:
            await notif.scroll_into_view_if_needed()
            await pg.wait_for_timeout(300)
            await click_at(pg, 'text=Bollo auto', pause=2.0)

        await pg.wait_for_timeout(1500)

        print("Done!")
        await ctx.close()
        await b.close()

        vids = glob.glob("/tmp/pv4/*.webm")
        if vids:
            shutil.move(vids[0], OUT)
            print(f"✅ {OUT}")
        else:
            print("❌ No video")

asyncio.run(main())
