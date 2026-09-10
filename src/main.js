import "./app.css";
import "leaflet/dist/leaflet.css";
import { mount } from "svelte";
import { applyTheme } from "./lib/theme.svelte.js";
import { initLang } from "./lib/i18n.svelte.js";
import App from "./App.svelte";

applyTheme();
initLang();

const target = document.getElementById("app");
if (target) mount(App, { target });
