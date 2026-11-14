"use strict";

const membersUrl = "data/members.json";
const spotlightContainer = document.querySelector("#spotlight-list");
const currentWeatherContainer = document.querySelector("#weather-current");
const forecastContainer = document.querySelector("#weather-forecast");
const menuToggle = document.querySelector("#menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

// Mobile navigation
menuToggle.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
});

// Footer information
const yearElement = document.querySelector("#current-year");
const modifiedElement = document.querySelector("#last-modified");
yearElement.textContent = new Date().getFullYear();
const modifiedDate = new Date(document.lastModified);
modifiedElement.textContent = Number.isNaN(modifiedDate.getTime())
  ? document.lastModified
  : modifiedDate.toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function safeWebsite(value = "") {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

// Load the JSON members and randomly select three Silver or Gold members.
async function loadSpotlights() {
  try {
    const response = await fetch(membersUrl);
    if (!response.ok) throw new Error(`Member data request failed: ${response.status}`);

    const allMembers = await response.json();
    const eligibleMembers = allMembers.filter((member) =>
      Number(member.membershipLevel) === 2 || Number(member.membershipLevel) === 3
    );

    // Fisher-Yates shuffle ensures a fresh random selection on each page load.
    const shuffledMembers = [...eligibleMembers];
    for (let index = shuffledMembers.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledMembers[index], shuffledMembers[randomIndex]] =
        [shuffledMembers[randomIndex], shuffledMembers[index]];
    }

    const selectedMembers = shuffledMembers.slice(0, 3);
    spotlightContainer.replaceChildren();

    if (selectedMembers.length === 0) {
      spotlightContainer.innerHTML = '<p class="error-message">No Silver or Gold members are available to feature.</p>';
      return;
    }

    selectedMembers.forEach((member) => {
      const levelName = Number(member.membershipLevel) === 3 ? "Gold Member" : "Silver Member";
      const card = document.createElement("article");
      card.className = "spotlight-card";

      const image = document.createElement("img");
      image.className = "spotlight-image";
      image.src = member.image ? `images/${encodeURIComponent(member.image)}` : "images/wcci.webp";
      image.alt = `${member.name} business image`;
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.src = "images/wcci.webp";
        image.alt = "WCCI logo used because the business image is unavailable";
      }, { once: true });

      const content = document.createElement("div");
      content.className = "spotlight-details";
      const title = document.createElement("h3");
      title.textContent = member.name;
      const tagline = document.createElement("p");
      tagline.className = "spotlight-tagline";
      tagline.textContent = member.tagline || member.description || "Proud chamber member";

      const badge = document.createElement("span");
      badge.className = `membership-badge ${levelName.toLowerCase().split(" ")[0]}`;
      badge.textContent = levelName;

      const phone = document.createElement("p");
      phone.innerHTML = `<strong>Phone:</strong> <a href="tel:${escapeHTML(String(member.phone || "").replace(/[^+\d]/g, ""))}">${escapeHTML(member.phone || "Not provided")}</a>`;
      const address = document.createElement("p");
      address.innerHTML = `<strong>Address:</strong> ${escapeHTML(member.address || "Not provided")}`;
      const website = document.createElement("p");
      const websiteUrl = safeWebsite(member.website);
      website.innerHTML = `<strong>Website:</strong> <a href="${escapeHTML(websiteUrl)}" target="_blank" rel="noopener noreferrer">Visit website</a>`;

      content.append(title, tagline, badge, phone, address, website);
      card.append(image, content);
      spotlightContainer.append(card);
    });
  } catch (error) {
    spotlightContainer.innerHTML = '<p class="error-message">Member spotlights could not load. Open the project with VS Code Live Server and check the console.</p>';
    console.error("Spotlight loading error:", error);
  }
}

function weatherIcon(description = "") {
  const text = description.toLowerCase();
  if (text.includes("thunder")) return "⛈️";
  if (text.includes("rain") || text.includes("drizzle")) return "🌧️";
  if (text.includes("snow")) return "🌨️";
  if (text.includes("cloud")) return text.includes("few") || text.includes("scattered") ? "🌤️" : "☁️";
  if (text.includes("clear")) return "☀️";
  if (text.includes("mist") || text.includes("fog")) return "🌫️";
  return "🌡️";
}

function formatForecastDate(dateText) {
  return new Date(`${dateText}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// OpenWeatherMap current weather and five-day/three-hour forecast endpoints.
async function loadWeather() {
  if (typeof OPENWEATHER_API_KEY === "undefined" ||
      !OPENWEATHER_API_KEY ||
      OPENWEATHER_API_KEY === "PASTE_YOUR_OPENWEATHERMAP_API_KEY_HERE") {
    currentWeatherContainer.innerHTML = '<p class="weather-message">Add your OpenWeatherMap API key in <code>scripts/config.js</code> to display live weather.</p>';
    forecastContainer.innerHTML = '<p class="weather-message">The three-day forecast will appear here after the API key is added.</p>';
    return;
  }

  const location = "Winneba,GH";
  const apiKey = encodeURIComponent(OPENWEATHER_API_KEY);
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`;

  try {
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);
    if (!currentResponse.ok) throw new Error(`Current weather request failed: ${currentResponse.status}`);
    if (!forecastResponse.ok) throw new Error(`Forecast request failed: ${forecastResponse.status}`);

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    const currentDescription = currentData.weather?.[0]?.description || "Weather unavailable";
    const currentTemp = Math.round(currentData.main.temp);
    const currentIcon = weatherIcon(currentDescription);

    currentWeatherContainer.innerHTML = `
      <div class="weather-icon" aria-hidden="true">${currentIcon}</div>
      <div class="weather-reading">
        <p class="temperature">${currentTemp}°C</p>
        <p class="weather-description">${escapeHTML(currentDescription)}</p>
        <p class="weather-location">Winneba, Ghana</p>
        <p class="feels-like">Feels like ${Math.round(currentData.main.feels_like)}°C</p>
      </div>`;

    const days = new Map();
    forecastData.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (date === new Date().toLocaleDateString("en-CA")) return;
      if (!days.has(date)) days.set(date, []);
      days.get(date).push(item);
    });

    const nextThreeDays = [...days.entries()].slice(0, 3);
    forecastContainer.replaceChildren();
    nextThreeDays.forEach(([date, readings]) => {
      const midday = readings.reduce((best, item) => {
        const hour = Number(item.dt_txt.slice(11, 13));
        const bestHour = Number(best.dt_txt.slice(11, 13));
        return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? item : best;
      }, readings[0]);
      const description = midday.weather?.[0]?.description || "Forecast";
      const dayCard = document.createElement("article");
      dayCard.className = "forecast-day";
      dayCard.innerHTML = `
        <h4>${formatForecastDate(date)}</h4>
        <span class="forecast-icon" aria-hidden="true">${weatherIcon(description)}</span>
        <p class="forecast-description">${escapeHTML(description)}</p>
        <p class="forecast-temperatures"><strong>${Math.round(midday.main.temp_max)}°C</strong> / ${Math.round(midday.main.temp_min)}°C</p>`;
      forecastContainer.append(dayCard);
    });

    if (nextThreeDays.length === 0) {
      forecastContainer.innerHTML = '<p class="weather-message">The forecast is not available right now.</p>';
    }
  } catch (error) {
    currentWeatherContainer.innerHTML = '<p class="weather-message">Live weather is temporarily unavailable. Check your API key and try again.</p>';
    forecastContainer.innerHTML = '<p class="weather-message">The three-day forecast could not be loaded.</p>';
    console.error("Weather loading error:", error);
  }
}

loadSpotlights();
loadWeather();
