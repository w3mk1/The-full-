// 1. قاعدة البيانات الموسعة والمترجمة
const suburbanLine = [
    { nameAr: "موزاية", nameEn: "Mouzaia", nameFr: "Mouzaia", lat: 36.4674, lng: 2.6865, price: 0, sched: ["06:00", "14:30"] },
    { nameAr: "البليدة", nameEn: "Blida", nameFr: "Blida", lat: 36.4806, lng: 2.8319, price: 30, sched: ["06:20", "14:50"] },
    { nameAr: "بوفاريك", nameEn: "Boufarik", nameFr: "Boufarik", lat: 36.5758, lng: 2.9125, price: 60, sched: ["06:50", "15:20"] },
    { nameAr: "بئر توتة", nameEn: "Birtouta", nameFr: "Birtouta", lat: 36.6433, lng: 3.0011, price: 80, sched: ["07:10", "15:40"] },
    { nameAr: "الحراش", nameEn: "El Harrach", nameFr: "El Harrach", lat: 36.7233, lng: 3.1344, price: 130, sched: ["07:35", "16:05"] },
    { nameAr: "آغا", nameEn: "Agha", nameFr: "Agha", lat: 36.7645, lng: 3.0538, price: 170, sched: ["07:55", "16:25"] },
    { nameAr: "الجزائر", nameEn: "Algiers", nameFr: "Alger", lat: 36.7761, lng: 3.0586, price: 180, sched: ["08:05", "16:35"] }
];

// 2. قاموس الترجمة الكامل
const dict = {
    ar: { 
        app: "سكة الجزائر", finder: "تنبيه الوصول (5 كم)", map: "تتبع المسار الحالي", near: "أقرب محطة:", 
        allSched: "جدول الرحلات والأسعار", set: "الإعدادات", dark: "تبديل الوضع الداكن", 
        h: "الرئيسية", t: "المواعيد", s: "الإعدادات", select: "حدد وجهتك لتفعيل التنبيه...",
        dist: "المسافة للوجهة:", alert: "تنبيه: اقتربت من وجهتك!", arrived: "وصلت للمحطة!"
    },
    en: { 
        app: "SNTF Tracker", finder: "Arrival Alert (5 km)", map: "Live Route Tracking", near: "Nearest Station:", 
        allSched: "Schedules & Prices", set: "Settings", dark: "Toggle Dark Mode", 
        h: "Home", t: "Schedules", s: "Settings", select: "Select destination for alert...",
        dist: "Distance to target:", alert: "Alert: Near destination!", arrived: "Arrived at station!"
    },
    fr: { 
        app: "SNTF Rail", finder: "Alerte Arrivée (5 km)", map: "Suivi du trajet", near: "Gare proche:", 
        allSched: "Horaires & Tarifs", set: "Paramètres", dark: "Mode Sombre", 
        h: "Accueil", t: "Horaires", s: "Réglages", select: "Choisir destination pour l'alerte...",
        dist: "Distance à destination:", alert: "Alerte: Destination proche !", arrived: "Vous êtes arrivé !"
    }
};

let map, userMarker, alarmTriggered = false;

// 3. دالة تغيير اللغة (تحدث كل عناصر الواجهة)
function changeLanguage(lang) {
    const t = dict[lang];
    document.getElementById('mainHtml').lang = lang;
    document.getElementById('mainHtml').dir = lang === 'ar' ? 'rtl' : 'ltr';

    // تحديث النصوص في index.html باستخدام المعرفات (IDs)
    document.getElementById('txt-app').innerText = t.app;
    document.getElementById('txt-finder').innerText = t.finder;
    document.getElementById('txt-map').innerText = t.map;
    document.getElementById('txt-near').innerText = t.near;
    document.getElementById('txt-all-sched').innerText = t.allSched;
    document.getElementById('txt-set').innerText = t.set;
    document.getElementById('nav-h').innerText = t.h;
    document.getElementById('nav-t').innerText = t.t;
    document.getElementById('nav-s').innerText = t.s;

    // تحديث قائمة المحطات المنسدلة
    const select = document.getElementById('stationSelect');
    const currentVal = select.value;
    select.innerHTML = `<option value="">${t.select}</option>` + 
        suburbanLine.map((s, i) => {
            let name = lang === 'ar' ? s.nameAr : (lang === 'fr' ? s.nameFr : s.nameEn);
            return `<option value="${i}">${name}</option>`;
        }).join('');
    select.value = currentVal;

    renderStations(); // إعادة رسم قائمة المواعيد باللغة الجديدة
}

// 4. رسم قائمة المواعيد والأسعار
function renderStations() {
    const list = document.getElementById('stationsList');
    const lang = document.getElementById('mainHtml').lang;
    list.innerHTML = suburbanLine.map(s => `
        <div class="card" style="margin: 10px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center">
                <b>${lang === 'ar' ? s.nameAr : (lang === 'fr' ? s.nameFr : s.nameEn)}</b>
                <span style="color:var(--primary); font-weight:bold;">${s.price} DA</span>
            </div>
            <div style="margin-top:10px">
                ${s.sched.map(t => `<span class="time-tag">${t}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// 5. تهيئة الخريطة وتتبع الموقع
function initMap() {
    map = L.map('map').setView([36.6, 2.9], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    userMarker = L.circleMarker([0,0], {radius: 9, color: '#fff', fillColor: '#1a73e8', fillOpacity: 1}).addTo(map);
}

function trackLocation() {
    navigator.geolocation.watchPosition(pos => {
        const { latitude, longitude, speed } = pos.coords;
        document.getElementById('speedValue').innerText = ((speed || 0)*3.6).toFixed(1);
        userMarker.setLatLng([latitude, longitude]);

        const idx = document.getElementById('stationSelect').value;
        const lang = document.getElementById('mainHtml').lang;

        if(idx !== "") {
            const dest = suburbanLine[idx];
            const dist = map.distance([latitude, longitude], [dest.lat, dest.lng]) / 1000;
            document.getElementById('distInfo').innerText = `${dict[lang].dist} ${dist.toFixed(2)} km`;
            
            if(dist <= 5.0 && !alarmTriggered) {
                alarmTriggered = true;
                document.getElementById('alarm-container').classList.add('alarm-active');
                if ("vibrate" in navigator) navigator.vibrate([500, 200, 500]);
                alert(dict[lang].alert);
            }
        }
    }, null, { enableHighAccuracy: true });
}

// 6. دوال الواجهة المساعدة
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${id}`).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    // إضافة كلاس active للعنصر الذي تم الضغط عليه
    if(id === 'home' && map) setTimeout(() => map.invalidateSize(), 400);
}

function toggleDarkMode() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

function updateAlarmSelection() {
    alarmTriggered = false;
    document.getElementById('alarm-container').classList.remove('alarm-active');
}

window.onload = () => {
    initMap(); 
    trackLocation(); 
    changeLanguage('ar'); // البدء بالعربية
    setInterval(() => {
        document.getElementById('digitalClock').innerText = new Date().toLocaleTimeString('en-GB');
    }, 1000);
};
