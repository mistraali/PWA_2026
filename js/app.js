// =====================
// GLOBAL STATE
// =====================
let map;
let currentPhoto = null;
let currentCoords = null;
let currentReportText = '';
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
const reportText = document.getElementById('report-text');

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

    enableShare();

    // pobierz GPS
    getLocation();
});

reportText.addEventListener('input', (event) => {
    currentReportText = event.target.value.trim();
    enableShare();
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
        const popupContent = `
            <div class="report-popup">
                <img src="${report.imageData}" alt="Zdjęcie zgłoszenia" class="report-popup-image" />
                <div class="report-popup-text">${report.text || 'Brak opisu'}</div>
            </div>
        `;

        const marker = L.marker([report.lat, report.lon])
            .addTo(map)
            .bindPopup(popupContent);

        reportMarkers.push(marker);
    });
}

// =====================
// LOCAL STORAGE
// =====================
function resizeImage(file, callback) {
    const reader = new FileReader();

    reader.onload = () => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxWidth = 320;
            const scale = Math.min(1, maxWidth / img.width);

            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            callback(imageData);
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);
}

function loadReports() {
    const savedReports = localStorage.getItem('citySpotterReports');

    if (!savedReports) {
        reports = [];
        return;
    }

    reports = JSON.parse(savedReports);
}

function saveReports() {
    try {
        localStorage.setItem('citySpotterReports', JSON.stringify(reports));
        return true;
    } catch (error) {
        console.error('Błąd zapisu zgłoszeń:', error);
        alert('Nie udało się zapisać zgłoszenia lokalnie. Pamięć aplikacji jest prawdopodobnie zapełniona.');
        return false;
    }
}

function saveCurrentReport() {
    if (!currentPhoto || !currentCoords || !currentReportText) return;

    resizeImage(currentPhoto, (imageData) => {
        const report = {
            id: Date.now(),
            imageData: imageData,
            text: currentReportText,
            lat: currentCoords.lat,
            lon: currentCoords.lon,
        };

        reports.unshift(report);

        const saved = saveReports();

        if (!saved) {
            reports.shift();
            return;
        }

        renderReports();
        renderMapMarkers();
        clearCurrentReport();
    });
}

function deleteReport(reportId) {
    reports = reports.filter((report) => report.id !== reportId);
    saveReports();
    renderReports();
    renderMapMarkers();
}

function clearCurrentReport() {
    currentPhoto = null;
    currentCoords = null;
    currentReportText = '';

    cameraInput.value = '';
    photoPreview.src = '';
    photoPreview.style.display = 'none';
    reportText.value = '';
    locationStatus.textContent = 'Oczekiwanie na sygnał GPS';

    enableShare();
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
                            <div class="report-message">${report.text || 'Brak opisu'}</div>
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

    btnShare.disabled = !(currentPhoto && currentCoords && currentReportText);

    btnShare.onclick = async () => {
        if (!currentCoords || !currentPhoto || !currentReportText) return;

        const { lat, lon } = currentCoords;
        const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}`;

        try {
            saveCurrentReport();

            if (navigator.share) {
                await navigator.share({
                    title: 'Zgłoszenie problemu',
                    text: `${currentReportText}\nLat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`,
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