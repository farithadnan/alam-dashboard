const pptr = require("puppeteer-core");
const CHROME = "/home/synthsloth/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
async function run(width, height, mobile) {
  const b = await pptr.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  let errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.setViewport({ width, height, isMobile: mobile, hasTouch: mobile });
  await p.goto("https://app.oh-alam.my/#/", { waitUntil: "domcontentloaded", timeout: 40000 });
  await new Promise((r) => setTimeout(r, 3000));
  await p.evaluate(() => { const e=[...document.querySelectorAll("button")].find(x=>/not now/i.test(x.textContent)); e && e.click(); });
  await new Promise((r) => setTimeout(r, 500));
  const btn = await p.evaluate(() => {
    const e=[...document.querySelectorAll("button")].find(x=>/^share$/i.test(x.getAttribute("aria-label")||""));
    if (!e) return null; const r=e.getBoundingClientRect(); return { x:r.x+r.width/2, y:r.y+r.height/2, right:r.right, bottom:r.bottom };
  });
  // NOTE: the full-screen close overlay is now transparent; click the button box, not the overlay
  if (btn) { mobile ? await p.touchscreen.tap(btn.x, btn.y) : await p.mouse.click(btn.x, btn.y); }
  await new Promise((r) => setTimeout(r, 500));
  const m = await p.evaluate(() => {
    const menu = document.querySelector('[role="menu"]');
    if (!menu) return { open:false };
    const r = menu.getBoundingClientRect();
    const items = [...menu.querySelectorAll('[role="menuitem"]')].map(e=>e.textContent.trim().replace(/\s+/g," "));
    const btnEl = [...document.querySelectorAll("button")].find(x=>/^share$/i.test(x.getAttribute("aria-label")||""));
    const br = btnEl ? btnEl.getBoundingClientRect() : null;
    return {
      open:true, itemCount: items.length, items,
      anchoredBelow: br ? (r.top >= br.bottom - 2) : null,  // menu top at/below button bottom (opening down)
      nearButtonNotCentered: br ? Math.abs(r.left - br.left) < 10 : null,
      withinX: r.left>=0 && r.right<=innerWidth, withinY: r.top>=0 && r.bottom<=innerHeight,
      menuRect:{x:Math.round(r.x),y:Math.round(r.y),top:Math.round(r.top),bottom:Math.round(r.bottom)}, btnRect: br?{top:Math.round(br.top),bottom:Math.round(br.bottom)}:null, vh:innerHeight
    };
  });
  console.log(width+"x"+height+": "+JSON.stringify(m)+" errs="+JSON.stringify(errs));
  await b.close();
}
(async () => { await run(1280, 900, false); await run(390, 844, true); })();
