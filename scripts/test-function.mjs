import { onRequest } from "../functions/api/[[path]].js";

const ctx = {
  env: { UDARA_API_ORIGIN: "https://helen-tiger-miss-shield.trycloudflare.com" },
  request: new Request("https://udara-dashboard.pages.dev/api/current?source=doe-eqms"),
};
const res = await onRequest(ctx);
const body = await res.text();
console.log("status:", res.status);
console.log("ct:", res.headers.get("content-type"));
console.log("sample:", body.slice(0, 90));
