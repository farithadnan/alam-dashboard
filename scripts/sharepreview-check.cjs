const pptr = require("puppeteer-core");
(async () => {
  const b = await pptr.launch({ executablePath: "/home/synthsloth/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome", headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  let errs = [];
  p.on("pageerror",(e)=>errs.push(String(e)));
  p.on("console",(m)=>{ if(m.type()==="error") errs.push(m.text()); });
  await p.setViewport({ width: 1100, height: 1000 });
  await p.goto("http://localhost:8788/#/share", { waitUntil: "domcontentloaded", timeout: 40000 });
  await new Promise((r)=>setTimeout(r,4000));
  await p.evaluate(()=>{ const e=[...document.querySelectorAll("button")].find(x=>/not now/i.test(x.textContent)); e&&e.click(); });
  await new Promise((r)=>setTimeout(r,1000));
  const info = await p.evaluate(()=>({
    title: (document.querySelector("h1,.qh")||{}).textContent||"",
    rows: [...document.querySelectorAll("tbody tr")].map((tr)=>[...tr.querySelectorAll("td")].map(td=>td.textContent.trim().replace(/\s+/g," ").slice(0,80))),
  }));
  console.log(JSON.stringify(info,null,1));
  console.log("ERRS="+JSON.stringify(errs));
  await b.close();
})();
