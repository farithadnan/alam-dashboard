  // Generic in-page device notifications (Windows + PWA).
  // Fires when the page is open; true closed-app push needs a service worker + Web
  // Push (VAPID). checkNotifications() compiles every new alert for the current
  // location into ONE Notification, edge-triggered so an ongoing alert isn't spam.
  import { activeWarnings } from "./warnings.js";
  import { getFlood } from "./api.js";

  export const notificationsAvailable = () => typeof Notification !== "undefined";
  export const notificationGranted = () => notificationsAvailable() && Notification.permission === "granted";
  export const notificationDenied = () => notificationsAvailable() && Notification.permission === "denied";

  export async function ensureNotifications() {
    if (!notificationsAvailable() || notificationGranted()) return notificationGranted();
    if (notificationDenied()) return false;
    try {
      return (await Notification.requestPermission()) === "granted";
    } catch {
      return false;
    }
  }

  export function notify({ title, body, tag }) {
    if (!notificationGranted()) return;
    try {
      const n = new Notification(title, { body, tag, requireInteraction: false });
      n.onclick = () => { window.focus(); n.close(); };
    } catch {
      /* some browsers throw on constructing from a worker/none - ignore */
    }
  }

  let lastKey = "";
  let busy = false;

  /** Collect + send ONE notification for whatever new alert the current place has. */
  export async function checkNotifications({ app }) {
    if (!notificationGranted() || busy) return;
    busy = true;
    try {
      const items = [];
      const warnings = activeWarnings(app.data?.hazards?.warnings ?? []);
      if (warnings.length) {
        const names = warnings.map((w) => (w && (w.title || w.text || w.area)) || "").filter(Boolean).slice(0, 3).join(", ");
        items.push(`${warnings.length} warning${warnings.length > 1 ? "s" : ""} in force${names ? ` · ${names}` : ""}`);
      }
      const air = (app.data?.stations ?? []).find((s) => s.station === app.town);
      if (air && ["Unhealthy", "Very Unhealthy", "Hazardous"].includes(air.band?.label)) {
        items.push(`Unhealthy air: ${air.value} AQI (${air.band?.label}) near you`);
      }
      const isNational = app.scope === "malaysia";
      const flood = await getFlood(isNational ? undefined : app.state || undefined).catch(() => null);
      const st = app.state;
      const danger = (flood?.river ?? []).filter((a) => !st || a.state === st).filter((a) => a.severity === "Danger").length;
      if (danger) items.push(`${danger} river${danger > 1 ? "s" : ""} at Danger in ${st || "Malaysia"}`);

      if (!items.length) return;
      const key = items.join("|");
      if (key === lastKey) return; // same set of alerts = already notified
      lastKey = key;
      notify({ title: "Alam alerts", body: items.join("\n"), tag: "alam-alerts" });
    } finally {
      busy = false;
    }
  }
