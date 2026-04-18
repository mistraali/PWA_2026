// =====================
// GLOBAL STATE
// =====================
let map;
let currentPhoto = null;
let currentCoords = null;
let reports = [];
let reportMarkers = [];

// =====================
// INIT
// =====================
console.log('APP START');

const btnCapture = document.getElementById('btn-capture');
const cameraInput = document.getElementById('camera-input');
const photoPreview = document.getElementById('photo-preview');
const locationStatus = document.getElementById('location-status');
const reportsList = document.getElementById('reports-list');

loadReports();
initMap();
renderReports();
enableShare();

// =====================
// MAPA STARTOWA
// =====================
function initMap() {
    console.log('INIT MAP');

    // domyślna mapa (świat)
    map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    renderMapMarkers();

    // fix renderowania
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

// =====================
// OBSŁUGA ZDJĘCIA
// =====================
btnCapture.addEventListener('click', () => {
    console.log('Klik - otwieram aparat');
    cameraInput.click();
});

cameraInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (!file) {
        console.log('Brak pliku');
        return;
    }

    console.log('Zdjęcie wybrane:', file);

    // zapis zdjęcia
    currentPhoto = file;

    // preview
    const imageURL = URL.createObjectURL(file);
    photoPreview.src = imageURL;
    photoPreview.style.display = 'block';

    // pobierz GPS
    getLocation();
});

// =====================
// GEOLOCATION
// =====================
function getLocation() {
    if (!navigator.geolocation) {
        locationStatus.textContent = 'Geolokacja nie jest wspierana';
        return;
    }

    locationStatus.textContent = 'Pobieranie lokalizacji...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            console.log('GPS OK:', lat, lon);

            currentCoords = { lat, lon };

            locationStatus.textContent = `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;

            showMap(lat, lon);
            enableShare();
        },
        (error) => {
            console.error('GPS ERROR:', error);
            locationStatus.textContent = 'Błąd GPS: ' + error.message;
        },
        {
            enableHighAccuracy: true,
        },
    );
}

// =====================
// MAPA + PINEZKA
// =====================
function showMap(lat, lon) {
    console.log('SHOW MAP START');

    if (!map) return;

    // przesunięcie mapy
    map.setView([lat, lon], 16);
}

function renderMapMarkers() {
    if (!map) return;

    reportMarkers.forEach((marker) => {
        marker.remove();
    });

    reportMarkers = [];

    reports.forEach((report) => {
        const marker = L.marker([report.lat, report.lon])
            .addTo(map)
            .bindPopup('Zapisane zgłoszenie 📸');

        reportMarkers.push(marker);
    });
}

// =====================
// LOCAL STORAGE
// =====================
function loadReports() {
    const savedReports = localStorage.getItem('citySpotterReports');

    if (!savedReports) {
        reports = [];
        return;
    }

    reports = JSON.parse(savedReports);
}

function saveReports() {
    localStorage.setItem('citySpotterReports', JSON.stringify(reports));
}

function saveCurrentReport() {
    if (!currentPhoto || !currentCoords) return;

    const reader = new FileReader();

    reader.onload = () => {
        const report = {
            id: Date.now(),
            imageData: reader.result,
            lat: currentCoords.lat,
            lon: currentCoords.lon,
        };

        reports.unshift(report);
        saveReports();
        renderReports();
        renderMapMarkers();
    };

    reader.readAsDataURL(currentPhoto);
}

function deleteReport(reportId) {
    reports = reports.filter((report) => report.id !== reportId);
    saveReports();
    renderReports();
    renderMapMarkers();
}

// =====================
// LISTA ZGŁOSZEŃ
// =====================
function renderReports() {
    if (!reports.length) {
        reportsList.innerHTML = '<p class="text-muted mb-0">Brak zapisanych zgłoszeń</p>';
        return;
    }

    reportsList.innerHTML = reports
        .map((report) => {
            return `
                <div class="report-item">
                    <div class="report-content">
                        <img src="${report.imageData}" alt="Miniatura zgłoszenia" class="report-thumb" />
                        <div class="report-text">
                            <div>Lat: ${report.lat.toFixed(5)}</div>
                            <div>Lon: ${report.lon.toFixed(5)}</div>
                        </div>
                    </div>
                    <button class="btn btn-link text-danger report-delete" data-id="${report.id}">
                        X
                    </button>
                </div>
            `;
        })
        .join('');

    const deleteButtons = document.querySelectorAll('.report-delete');

    deleteButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const reportId = Number(button.dataset.id);
            deleteReport(reportId);
        });
    });
}

// =====================
// UDOSTĘPNIANIE
// =====================
function enableShare() {
    const btnShare = document.getElementById('btn-share');

    btnShare.disabled = !(currentPhoto && currentCoords);

    btnShare.onclick = async () => {
        if (!currentCoords || !currentPhoto) return;

        const { lat, lon } = currentCoords;
        const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}`;

        try {
            saveCurrentReport();

            if (navigator.share) {
                await navigator.share({
                    title: 'Zgłoszenie problemu',
                    text: 'Zobacz lokalizację problemu',
                    url: url,
                    files: [currentPhoto],
                });
            } else {
                alert('Twoja przeglądarka nie wspiera udostępniania');
            }
        } catch (err) {
            console.error('Błąd udostępniania:', err);
        }
    };
}


// =====================
// SERVICE WORKER
// =====================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(() => console.log("service worker registered"))
            .catch((err) => console.log("service worker not registered", err));
    });
}