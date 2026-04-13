// =====================
// GLOBAL STATE
// =====================
let map;
let marker;
let currentPhoto = null;
let currentCoords = null;

// =====================
// INIT
// =====================
console.log('APP START');

initMap();

const btnCapture = document.getElementById('btn-capture');
const cameraInput = document.getElementById('camera-input');
const photoPreview = document.getElementById('photo-preview');
const locationStatus = document.getElementById('location-status');

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

    // usuń poprzedni marker
    if (marker) {
        marker.remove();
    }

    // dodaj marker
    marker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup('Tutaj wykonano zdjęcie 📸')
        .openPopup();
}

// =====================
// UDOSTĘPNIANIE
// =====================
function enableShare() {
    const btnShare = document.getElementById('btn-share');

    btnShare.disabled = false;

    btnShare.onclick = async () => {
        if (!currentCoords) return;

        const { lat, lon } = currentCoords;
        const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Zgłoszenie problemu',
                    text: 'Zobacz lokalizację problemu',
                    url: url,
                    files: currentPhoto ? [currentPhoto] : [],
                });
            } else {
                alert('Twoja przeglądarka nie wspiera udostępniania');
            }
        } catch (err) {
            console.error('Błąd udostępniania:', err);
        }
    };
}
