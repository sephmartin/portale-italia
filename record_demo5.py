#!/usr/bin/env python3
"""Record smooth mobile demo with visible clicks — v5."""
import asyncio, glob, shutil
from playwright.async_api import async_playwright

URL = "https://portale-italia.online"
OUT = "/home/ubuntu/portale-italia-src/demo-mobile.mp4"
W, H = 393, 852

CLICK_JS = """
(() => {
  if (document.getElementById('__click_dot')) return;
  const dot = document.createElement('div');
  dot.id = '__click_dot';
  Object.assign(dot.style, {
    position:'fixed', width:'44px', height:'44px', borderRadius:'50%',
    border:'3px solid rgba(0,100,255,0.8)', background:'rgba(0,100,255,0.15)',
    pointerEvents:'none', zIndex:'99999', transition:'all 0.15s ease',
    transform:'translate(-50%,-50%) scale(0)', opacity:'0'
  });
  document.body.appendChild(dot);
  window.__showClick = (x,y) => {
    dot.style.left=x+'px'; dot.style.top=y+'px';
    dot.style.transform='translate(-50%,-50%) scale(1)'; dot.style.opacity='1';
    setTimeout(()=>{dot.style.transform='translate(-50%,-50%) scale(1.5)';dot.style.opacity='0';},300);
  };
})();
"""

async def show_click(pg, x, y):
    await pg.evaluate(f"window.__showClick && window.__showClick({x},{y})")
    await pg.wait_for_timeout(150)

async def click_el(pg, sel, pause=1.2):
    el = pg.locator(sel).first
    if await el.count() > 0:
        box = await el.bounding_box()
        if box:
            await show_click(pg, box['x']+box['width']/2, box['y']+box['height']/2)
            await el.click(timeout=5000)
            await pg.wait_for_timeout(int(pause*1000))
            return True
    return False

async def smooth_scroll(pg, target, ms=1200):
    await pg.evaluate(f"""
    (()=>{{const s=window.scrollY,d={target}-s,t=performance.now(),m={ms};
    function f(p){{const r=Math.min((p-t)/m,1),e=r<.5?2*r*r:-1+(4-2*r)*r;
    window.scrollTo(0,s+d*e);if(r<1)requestAnimationFrame(f);}}
    requestAnimationFrame(f);}})()""")
    await pg.wait_for_timeout(ms+200)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(
            viewport={"width":W,"height":H}, device_scale_factor=3,
            is_mobile=True, has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
            record_video_dir="/tmp/pv5/", record_video_size={"width":W,"height":H}
        )
        pg = await ctx.new_page()

        # Load + inject click indicator
        await pg.goto(URL, wait_until="networkidle", timeout=30000)
        await pg.evaluate(CLICK_JS)
        await pg.wait_for_timeout(2000)

        # ── 1. Hub ──
        print("1 Hub")
        await pg.wait_for_timeout(1500)
        await smooth_scroll(pg, 450, 1200)
        await pg.wait_for_timeout(800)
        await smooth_scroll(pg, 0, 1000)
        await pg.wait_for_timeout(600)

        # ── 2. Hamburger ──
        print("2 Hamburger")
        await click_el(pg, 'button[aria-label="Menu"]', pause=1.5)
        await pg.wait_for_timeout(1000)
        # Close with Escape
        await pg.keyboard.press("Escape")
        await pg.wait_for_timeout(800)

        # ── 3. INPS card ──
        print("3 INPS")
        await smooth_scroll(pg, 600, 1000)
        await pg.wait_for_timeout(500)
        ok = await click_el(pg, 'a[href*="/inps"]', pause=2.0)
        if not ok:
            await pg.goto(f"{URL}/#/inps", wait_until="networkidle", timeout=15000)
            await pg.evaluate(CLICK_JS)
            await pg.wait_for_timeout(2000)
        await smooth_scroll(pg, 250, 1000)
        await pg.wait_for_timeout(1000)

        # ── 4. Dashboard via bell ──
        print("4 Dashboard")
        await pg.goto(URL, wait_until="networkidle", timeout=15000)
        await pg.evaluate(CLICK_JS)
        await pg.wait_for_timeout(1000)
        await click_el(pg, 'header a[href*="dashboard"]', pause=2.0)

        # Scroll dashboard
        await smooth_scroll(pg, 350, 1200)
        await pg.wait_for_timeout(800)
        await smooth_scroll(pg, 700, 1200)
        await pg.wait_for_timeout(800)
        await smooth_scroll(pg, 0, 1000)
        await pg.wait_for_timeout(500)

        # ── 5. Click notification ──
        print("5 Notification")
        notif = pg.locator('text=Bollo auto').first
        if await notif.count() > 0:
            await notif.scroll_into_view_if_needed()
            await pg.wait_for_timeout(300)
            await click_el(pg, 'text=Bollo auto', pause=2.0)

        await pg.wait_for_timeout(1500)

        print("Done!")
        await ctx.close()
        await b.close()

        vids = glob.glob("/tmp/pv5/*.webm")
        if vids:
            shutil.move(vids[0], OUT)
            print(f"✅ {OUT}")
        else:
            print("❌ No video")

asyncio.run(main())
