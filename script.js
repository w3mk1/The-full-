// بيانات المحطات
const suburbanLine = [
    { nameAr: "موزاية", nameEn: "Mouzaia", lat: 36.4674, lng: 2.6865, price: 0, sched: ["06:00", "14:30"] },
    { nameAr: "البليدة", nameEn: "Blida", lat: 36.4806, lng: 2.8319, price: 30, sched: ["06:20", "14:50"] },
    { nameAr: "بوفاريك", nameEn: "Boufarik", lat: 36.5758, lng: 2.9125, price: 60, sched: ["06:50", "15:20"] },
    { nameAr: "الحراش", nameEn: "El Harrach", lat: 36.7233, lng: 3.1344, price: 130, sched: ["07:35", "16:05"] },
    { nameAr: "الجزائر", nameEn: "Algiers", lat: 36.7761, lng: 3.0586, price: 180, sched: ["08:05", "16:35"] }
];

let map, userMarker, alarmTriggered = false;

// تهيئة الخريطة
function initMap() {
    map = L.map('map').setView([36.6, 2.9], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    userMarker = L.circleMarker([0,0], {radius: 9, color: '#fff', fillColor: '#1a73e8', fillOpacity: 1}).addTo(map);
}

// تتبع الموقع والسرعة والتنبيه
function trackLocation() {
    navigator.geolocation.watchPosition(pos => {
        const { latitude, longitude, speed } = pos.coords;
        document.getElementById('speedValue').innerText = ((speed || 0)*3.6).toFixed(1);
        userMarker.setLatLng([latitude, longitude]);

        // حساب المسافة للتنبيه
        const idx = document.getElementById('stationSelect').value;
        if(idx !== "") {
            const dest = suburbanLine[idx];
            const dist = map.distance([latitude, longitude], [dest.lat, dest.lng]) / 1000;
            document.getElementById('distInfo').innerText = `المسافة للوجهة: ${dist.toFixed(2)} كم`;
            
            if(dist <= 5.0 && !alarmTriggered) {
                alarmTriggered = true;
                document.getElementById('alarm-container').classList.add('alarm-active');
                if ("vibrate" in navigator) navigator.vibrate([500, 200, 500]);
                alert("تنبيه: اقتربت من وجهتك!");
            }
        }
    }, null, { enableHighAccuracy: true });
}

function updateAlarmSelection() {
    alarmTriggered = false;
    document.getElementById('alarm-container').classList.remove('alarm-active');
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${id}`).classList.add('active');
    if(id === 'home' && map) setTimeout(() => map.invalidateSize(), 400);
}

function toggleDarkMode() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

window.onload = () => {
    initMap(); trackLocation();
    const select = document.getElementById('stationSelect');
    select.innerHTML = '<option value="">حدد وجهتك لتفعيل التنبيه...</option>' + 
        suburbanLine.map((s, i) => `<option value="${i}">${s.nameAr}</option>`).join('');
    
    // الساعة
    setInterval(() => {
        document.getElementById('digitalClock').innerText = new Date().toLocaleTimeString('en-GB');
    }, 1000);
};
