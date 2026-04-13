# CitySpotter – Aplikacja zgłoszeń miejskich (PWA)

## Opis aplikacji

CitySpotter to mobilna aplikacja typu **Progressive Web App (PWA)**, umożliwiająca użytkownikom zgłaszanie problemów miejskich, takich jak:

- dziury w drodze
- nielegalne wysypiska śmieci
- uszkodzona infrastruktura, itp...

Aplikacja pozwala użytkownikowi:

- wykonać zdjęcie problemu (kamera urządzenia)
- automatycznie pobrać lokalizację GPS
- wyświetlić miejsce zgłoszenia na mapie (OpenStreetMap – Leaflet)
- udostępnić zgłoszenie (Web Share API)

---

## Wykorzystane technologie

- HTML5
- CSS3 (Bootstrap)
- JavaScript (ES6)
- Leaflet.js + OpenStreetMap
- Web APIs:
  - Geolocation API
  - Media Capture (input file / kamera)
  - Web Share API
- PWA:
  - manifest.json
  - Service Worker

---

## Zespół projektowy

| Imię       | Nazwisko | Nr grupy dziekańskiej | Nr albumu |
| ---------- | -------- | --------------------- | --------- |
| Krzysztof  | Ćwikła   | ZIISN1 - 3611IO       | XXXXXX    |
| Bartłomiej | Kapusta  | ZIISN1 - 3611IO       | XXXXXX    |
| Tomasz     | Wojdyła  | ZIISN1 - 3611IO       | 234216    |

---

## Uwagi

- Aplikacja działa najlepiej na urządzeniach mobilnych
- Geolokacja wymaga połączenia HTTPS lub localhost
- Web Share API działa głównie na urządzeniach mobilnych
