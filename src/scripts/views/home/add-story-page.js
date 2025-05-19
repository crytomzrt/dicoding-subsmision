import AddStoryPresenter from "../../presenter/stories-presenter/add-story-presenter";

export default class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.capturedPhotoBlob = null;
  }

  async render() {
    return `
      <div class="container">
        <div class="add-story-container">
          <div class="section-header">
            <h1><i class="fas fa-plus-circle"></i> Add New Story</h1>
            <p>Share your experience with the community</p>
          </div>
          
          <div id="offline-warning" class="offline-notice" style="display:none;">
            <h3><i class="fas fa-wifi-slash"></i> Offline Mode Detected</h3>
            <p>Adding stories is unavailable while offline. Please connect to the internet to add a new story.</p>
          </div>
          
          <div id="error-container" class="error-message" style="display:none;"></div>
          <div id="success-container" class="success-message" style="display:none;"></div>
          
          <form id="add-story-form">
            <div class="form-group">
              <label for="description"><i class="fas fa-edit"></i> Description</label>
              <textarea id="description" placeholder="Tell your story..." required></textarea>
            </div>

            <div class="form-group camera-section">
              <label><i class="fas fa-camera"></i> Take a photo</label>
              <video id="camera-stream" autoplay></video>
              <div class="camera-controls">
                <button type="button" id="capture-btn" class="camera-btn"><i class="fas fa-camera"></i> Capture Photo</button>
                <button type="button" id="retake-btn" class="camera-btn" style="display:none;"><i class="fas fa-redo"></i> Retake</button>
              </div>
              <canvas id="snapshot-canvas" style="display:none;"></canvas>
            </div>

            <div class="form-group">
              <label for="photo"><i class="fas fa-image"></i> Or upload image</label>
              <input type="file" id="photo" name="photo" accept="image/*" class="file-input" />
            </div>

            <div class="form-group location-section">
              <label><i class="fas fa-map-marker-alt"></i> Select Location</label>
              <p class="form-hint">Click on the map to set your location or enter coordinates manually</p>
              <div id="map" style="height: 300px;"></div>
            </div>

            <div class="coordinates-group">
              <div class="form-group">
                <label for="lat">Latitude</label>
                <input type="number" id="lat" step="any" placeholder="e.g. -6.2088" />
              </div>
              <div class="form-group">
                <label for="lon">Longitude</label>
                <input type="number" id="lon" step="any" placeholder="e.g. 106.8456" />
              </div>
            </div>

            <button type="submit" class="primary-button"><i class="fas fa-paper-plane"></i> Submit Story</button>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this.presenter.init();

    // Check if we can initialize map (only if online)
    if (!navigator.onLine) {
      this.showOfflineMapMessage();
      return;
    }

    try {
      const map = L.map("map").setView([-6.2, 106.8], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      let marker = null;

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById("lat").value = lat.toFixed(6);
        document.getElementById("lon").value = lng.toFixed(6);

        if (marker) {
          marker.setLatLng([lat, lng]);
        } else {
          marker = L.marker([lat, lng]).addTo(map);
        }

        marker
          .bindPopup(`Lat: ${lat.toFixed(6)}, Lon: ${lng.toFixed(6)}`)
          .openPopup();
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      this.showOfflineMapMessage();
    }

    // Add retake button functionality
    const retakeBtn = document.getElementById('retake-btn');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        document.getElementById('camera-stream').style.display = 'block';
        document.getElementById('snapshot-canvas').style.display = 'none';
        document.getElementById('capture-btn').style.display = 'inline-block';
        retakeBtn.style.display = 'none';
        this.capturedPhotoBlob = null;
      });
    }
  }

  updateOfflineStatus(isOffline) {
    const offlineWarning = document.getElementById('offline-warning');
    const form = document.getElementById('add-story-form');
    const captureBtn = document.getElementById('capture-btn');
    
    if (isOffline) {
      offlineWarning.style.display = 'block';
      form.style.opacity = '0.5';
      form.style.pointerEvents = 'none';
      this.showOfflineMapMessage();
    } else {
      offlineWarning.style.display = 'none';
      form.style.opacity = '1';
      form.style.pointerEvents = 'auto';
      // Try reinitializing camera
      this.presenter.initCamera().catch(console.error);
    }
  }
  
  showOfflineMapMessage() {
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="offline-map-message">
          <h3><i class="fas fa-exclamation-triangle"></i> Map unavailable in offline mode</h3>
          <p>Internet connection is required to display the map.</p>
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
  
  showError(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      errorContainer.style.display = 'block';
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        errorContainer.style.display = 'none';
      }, 5000);
    } else {
      // Fallback to alert if container not found
      alert(message);
    }
  }
  
  showSuccess(message) {
    const successContainer = document.getElementById('success-container');
    if (successContainer) {
      successContainer.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
      successContainer.style.display = 'block';
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        successContainer.style.display = 'none';
      }, 3000);
    } else {
      // Fallback to alert if container not found
      alert(message);
    }
  }

  addCaptureButtonListener(listener) {
    document.getElementById("capture-btn").addEventListener("click", listener);
  }

  addFormSubmitListener(listener) {
    document
      .getElementById("add-story-form")
      .addEventListener("submit", listener);
  }

  async capturePhoto() {
    const video = document.getElementById("camera-stream");
    const canvas = document.getElementById("snapshot-canvas");
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          this.capturedPhotoBlob = blob;
          resolve(blob);
        },
        "image/jpeg",
        0.8
      );
    });
  }

  getFormData() {
    const description = document.getElementById("description").value.trim();
    const lat = document.getElementById("lat").value || undefined;
    const lon = document.getElementById("lon").value || undefined;
    const photoInput = document.getElementById("photo");

    const photo =
      photoInput.files.length > 0
        ? photoInput.files[0]
        : this.capturedPhotoBlob;

    return {
      description,
      photo,
      lat,
      lon,
    };
  }

  displayCapturedPhoto(blob) {
    const canvas = document.getElementById("snapshot-canvas");
    const captureBtn = document.getElementById("capture-btn");
    const retakeBtn = document.getElementById("retake-btn");
    const video = document.getElementById("camera-stream");
    
    // Show the canvas with the captured photo
    canvas.style.display = "block";
    video.style.display = "none";
    
    // Show retake button, hide capture button
    captureBtn.style.display = "none";
    if (retakeBtn) {
      retakeBtn.style.display = "inline-block";
    }
  }
}
