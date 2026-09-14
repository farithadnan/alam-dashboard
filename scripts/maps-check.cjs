const pptr = require("puppeteer-core");
const CHROME = "/home/synthsloth/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
async function check(hash) {
  const b = await pptr.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  let errs = [];
  p.on("pageerror", (e) => errs.push("pageerror " + String(e)));
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await p.setViewport({ width: 1000, height: 900 });
  await p.goto("http://localhost:8788/#/" + hash, { waitUntil: "domcontentloaded", timeout: 40000 });
  await new Promise((r) => setTimeout(r, 2500));
  await p.evaluate(() => { const e=[...document.querySelectorAll("button")].find(x=>/not now/i.test(x.textContent)); e && e.click(); });
  await new Promise((r) => setTimeout(r, 300));
  // Flood map only renders when in-scope alert points exist; use the "Malaysia" scope (has river points).
  if (hash === "flood") {
    await p.evaluate(() => { const e=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="Malaysia"); e && e.click(); });
  }
  await new Promise((r) => setTimeout(r, 6000));
  const info = await p.evaluate(() => ({
    hasMap: !!document.querySelector(".leaflet-container"),
    markers: document.querySelectorAll(".leaflet-marker-icon").length,
    pins: document.querySelectorAll(".alam-pin").length,
    heading: (document.querySelector("h1,.qh")||{}).textContent || "",
    bodyLen: document.body.innerText.length,
    anyText: document.body.innerText.slice(0, 160),
  }));
  console.log("#/" + hash + ": " + JSON.stringify(info));
  console.log("  errs=" + JSON.stringify(errs));
  await b.close();
}
(async () => { await check("flood"); await check("earthquakes"); })();
