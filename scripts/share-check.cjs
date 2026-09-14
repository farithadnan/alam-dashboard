const pptr = require("puppeteer-core");
const CHROME = "/home/synthsloth/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const BASE = process.env.BASE || "http://localhost:8788";
async function run(width, height, mobile) {
  const b = await pptr.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  let errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.setViewport({ width, height, isMobile: mobile, hasTouch: mobile });
  await p.goto(BASE + "/#/", { waitUntil: "domcontentloaded", timeout: 40000 });
  await new Promise((r) => setTimeout(r, 3000));
  await p.evaluate(() => { const e=[...document.querySelectorAll("button")].find(x=>/not now/i.test(x.textContent)); e && e.click(); });
  await new Promise((r) => setTimeout(r, 500));
  const box = await p.evaluate(() => {
    const e=[...document.querySelectorAll("button")].find(x=>/^share$/i.test(x.getAttribute("aria-label")||""));
    if (!e) return null; const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
  });
  if (box) { mobile ? await p.touchscreen.tap(box.x, box.y) : await p.mouse.click(box.x, box.y); }
  await new Promise((r) => setTimeout(r, 500));
  const m = await p.evaluate(() => {
    const menu = document.querySelector('[role="menu"]');
    if (!menu) return { open:false };
    const s = getComputedStyle(menu); const r = menu.getBoundingClientRect();
    const items = [...menu.querySelectorAll('[role="menuitem"]')].map(e=>e.textContent.trim().replace(/\s+/g," "));
    return { open:true, position:s.position, itemCount:items.length, withinX:r.left>=0&&r.right<=innerWidth, withinY:r.top>=0&&r.bottom<=innerHeight, rect:{x:Math.round(r.x),y:Math.round(r.y),b:Math.round(r.bottom)}, vh:innerHeight };
  });
  console.log(`${width}x${height}: `+JSON.stringify(m)+" errs="+JSON.stringify(errs));
  await b.close();
}
(async () => { await run(1280, 900, false); await run(390, 844, true); })();
