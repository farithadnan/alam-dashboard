const pptr = require("puppeteer-core");
(async () => {
  const b = await pptr.launch({
    executablePath: "/home/synthsloth/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  const p = await b.newPage();
  let errs = [];
  p.on("pageerror", (e) => errs.push("pageerror: " + String(e)));
  p.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text()); });
  await p.goto("http://localhost:8080/#/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));
  const text = await p.evaluate(() => document.body.innerText);
  const checks = {
    newIntro: /Live weather, air quality and hazard alerts for Malaysia\./.test(text),
    noTradeSlogan: !/trusted, not re-sold|built on open official data/i.test(text),
    elNinoDated: /September 2026 into January 2027/.test(text),
    elNinoEffect: /reduced rainfall and hotter, drier weather/.test(text),
    updatedCue: /Updated/.test(text),
    bodyLen: text.length,
  };
  console.log("CHECKS=" + JSON.stringify(checks));
  console.log("ERRS=" + JSON.stringify(errs));
  console.log("HEAD>>>");
  console.log(text.split("\n").filter(Boolean).slice(0, 16).join(" | "));
  await b.close();
})();
