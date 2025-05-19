import DetailPagePresenter from "../../presenter/stories-presenter/detail-presenter";

let map;

export default class DetailStoryPage {
  constructor() {
    this.presenter = new DetailPagePresenter(this);
  }

  async render() {
    return `
      <div class="container">
        <div class="detail-story-container">
          <div class="detail-header">
            <a href="#/" class="back-button"><i class="fas fa-arrow-left"></i> Back</a>
            <h1 id="story-title">Loading...</h1>
          </div>
          
          <div class="detail-content">
            <div class="detail-image-container">
              <img id="story-image" alt="Story Image" />
            </div>
            
            <div class="detail-info">
              <div class="detail-meta">
                <span id="story-created-at"></span>
                <span id="story-location"></span>
              </div>
              
              <div class="story-description">
                <p id="story-description"></p>
              </div>
            </div>
          </div>
          
          <div class="map-container">
            <h2>Location</h2>
            <div id="map" style="height: 400px;"></div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const id = window.location.hash.split("/")[2]; // Dapatkan ID dari URL
    this.presenter.init(id); // Panggil presenter untuk load data
  }

  displayStory(story) {
    document.getElementById("story-title").innerText = story.name;
    document.getElementById("story-image").src = story.photoUrl;
    document.getElementById("story-image").onerror = function() {
      this.src = '/favicon.png';
      this.alt = 'Image not available offline';
    };
    document.getElementById("story-description").innerText = story.description;
    document.getElementById("story-created-at").innerHTML = `<i class="fas fa-clock"></i> ${new Date(story.createdAt).toLocaleString()}`;
    
    if (story.lat && story.lon) {
      document.getElementById("story-location").innerHTML = `<i class="fas fa-map-marker-alt"></i> ${story.lat}, ${story.lon}`;
    } else {
      document.getElementById("story-location").innerHTML = '<i class="fas fa-map-marker-alt"></i> Lokasi tidak tersedia';
    }
  }

  showErrorMessage(message) {
    document.getElementById("story-title").innerText = 'Error';
    document.getElementById("story-description").innerHTML = `
      <div class="error-message">${message}</div>
    `;
    document.getElementById("story-image").style.display = 'none';
    document.getElementById("story-created-at").style.display = 'none';
    document.getElementById("story-location").style.display = 'none';
    
    // Hide map container
    const mapContainer = document.querySelector(".map-container");
    if (mapContainer) {
      mapContainer.style.display = 'none';
    }
  }
  
  showOfflineMapMessage() {
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="offline-map-message">
          <h3>Map tidak tersedia dalam mode offline</h3>
          <p>Koneksi internet diperlukan untuk menampilkan peta.</p>
        </div>
      `;
      mapContainer.style.display = 'flex';
      mapContainer.style.justifyContent = 'center';
      mapContainer.style.alignItems = 'center';
      mapContainer.style.backgroundColor = 'var(--background-light)';
      mapContainer.style.border = '1px solid #ddd';
      mapContainer.style.borderRadius = 'var(--border-radius-lg)';
      mapContainer.style.padding = '20px';
      mapContainer.style.textAlign = 'center';
    }
  }
  
  showNoCoordinatesMessage() {
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="offline-map-message">
          <h3>Lokasi tidak tersedia</h3>
          <p>Story ini tidak memiliki data koordinat.</p>
        </div>
      `;
      mapContainer.style.display = 'flex';
      mapContainer.style.justifyContent = 'center';
      mapContainer.style.alignItems = 'center';
      mapContainer.style.backgroundColor = 'var(--background-light)';
      mapContainer.style.border = '1px solid #ddd';
      mapContainer.style.borderRadius = 'var(--border-radius-lg)';
      mapContainer.style.padding = '20px';
      mapContainer.style.textAlign = 'center';
    }
  }

  initializeMap(lat, lon, title, description, photoUrl) {
    if (map) {
      map.remove();
      map = null;
    }
    
    // Clear any previous messages
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      mapContainer.innerHTML = '';
      mapContainer.style = ''; // Reset custom styles
      mapContainer.style.height = '400px';
    }

    if (!window.L) {
      console.error("Leaflet library not loaded!");
      this.showOfflineMapMessage();
      return;
    }

    map = L.map("map").setView([lat, lon], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const marker = L.marker([lat, lon]).addTo(map);
    const popupContent = `
      <div style="text-align: center;">
        <img src="${photoUrl}" alt="${title}" style="width: 100px; height: auto; margin-bottom: 5px;" />
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    `;
    marker.bindPopup(popupContent).openPopup();
  }
}
