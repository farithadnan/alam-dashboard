const pptr = require("puppeteer-core");
(async () => {
  const b = await pptr.launch({ executablePath: "/home/synthsloth/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome", headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  let errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.goto("https://app.oh-alam.my/#/", { waitUntil: "domcontentloaded", timeout: 40000 });
  await new Promise((r) => setTimeout(r, 3000));
  await p.evaluate(() => { const e=[...document.querySelectorAll("button")].find(x=>/not now/i.test(x.textContent)); e && e.click(); });
  await new Promise((r) => setTimeout(r, 500));
  const box = await p.evaluate(() => {
    const e=[...document.querySelectorAll("button")].find(x=>/^share$/i.test(x.getAttribute("aria-label")||""));
    if (!e) return null; const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
  });
  if (box) await p.touchscreen.tap(box.x, box.y);
  await new Promise((r) => setTimeout(r, 700));
  // element screenshot of the menu
  const wrote = await p.evaluate(() => {
    const menu = document.querySelector('[role="menu"]');
    return menu ? { yes: true } : { yes: false };
  });
  if (wrote.yes) {
    const el = await p.$('[role="menu"]');
    await el.screenshot({ path: "/tmp/share-menu.png" });
  }
  await p.screenshot({ path: "/tmp/share-full.png" });
  console.log("saved /tmp/share-menu.png and /tmp/share-full.png errs=" + JSON.stringify(errs));
  await b.close();
})();
