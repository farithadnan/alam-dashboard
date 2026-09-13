  <!-- TEMP dev page: shows every WeatherBanner scene together. Remove after review. -->
  <script>
    import WeatherBanner from "./ui/WeatherBanner.svelte";

    const BANNERS = [
      { icon: "☀️", label: "Sunny" },
      { icon: "⛅", label: "Partly cloudy" },
      { icon: "☁️", label: "Overcast / cloudy" },
      { icon: "🌧️", label: "Rain" },
      { icon: "⛈️", label: "Thunderstorm" },
      { icon: "🌫️", label: "Mist / haze" },
      { icon: "🌙", label: "Night" },
    ];
    const AQI = { value: 42, band: "Moderate", color: "#8f5c00" };
  </script>

  <div class="space-y-3">
    {#each BANNERS as b (b.label)}
      <WeatherBanner icon={b.icon} label={b.label} temp={27} feels={31} townName="Alam" appState="Malaysia" aqi={AQI} />
    {/each}
    <p class="caption mt-2">All 7 banner scenes (temp/AQI are dummy values). Reached via <code>#/banners</code> — remove after review.</p>
  </div>
