import Map from "https://cdn.skypack.dev/ol/Map.js";
import OSM from "https://cdn.skypack.dev/ol/source/OSM.js";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import View from "https://cdn.skypack.dev/ol/View.js";
import { fromLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import Overlay from "https://cdn.skypack.dev/ol/Overlay.js";

// Initialize the map
const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([0, 0]),
    zoom: 2,
  }),
});

// Popup overlay for location info
const popup = document.createElement("div");
popup.className = "popup";
const overlay = new Overlay({
  element: popup,
  positioning: "bottom-center",
  stopEvent: false,
  offset: [0, -10],
});
map.addOverlay(overlay);

// Zoom controls
document.getElementById("zoom-in").addEventListener("click", () => {
  const view = map.getView();
  view.setZoom(view.getZoom() + 1);
});

document.getElementById("zoom-out").addEventListener("click", () => {
  const view = map.getView();
  view.setZoom(view.getZoom() - 1);
});

// Get location and display detailed information
document.getElementById("get-location").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const coords = [position.coords.longitude, position.coords.latitude];
      map.getView().setCenter(fromLonLat(coords));
      map.getView().setZoom(14);
      
      // Display latitude and longitude
      document.getElementById("location").textContent = `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`;

      // Fetch address details using Nominatim API
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
      const data = await response.json();
      
      if (data.address) {
        const road = data.address.road || data.address.suburb || "Unknown Road";
        const city = data.address.city || data.address.town || data.address.village || "Unknown City";
        const postcode = data.address.postcode || "Unknown Postal Code";
        const state = data.address.state || "Unknown State";
        const district = data.address.district || "Unknown District";
        
        const address = `${road}, ${district}, ${city}, ${postcode}, ${state}`;
        popup.textContent = `You are at: ${address}`;
        overlay.setPosition(fromLonLat(coords));
      } else {
        popup.textContent = "Address not found.";
        overlay.setPosition(fromLonLat(coords));
      }
      
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});
