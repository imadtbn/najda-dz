// تهيئة الخريطة
let map = L.map('map').setView([36.7525, 3.0418], 10); // إحداثيات الجزائر العاصمة
let userMarker = null;
let userLocation = null;
let miniMap = null;
let miniMarker = null;
let miniRouteLine = null;

// إضافة طبقة الخريطة
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// بيانات وهمية لمراكز الخدمات في الجزائر - تم تصحيح التسمية لتكون متسقة
const serviceLocations = {
    hospitals: [
        { name: "مستشفى مصطفى باشا", lat: 36.7516, lng: 3.0588, phone: "023 41 41 41", address: "الجزائر العاصمة" },
        { name: "مستشفى بني مسوس", lat: 36.7350, lng: 3.0150, phone: "023 41 42 42", address: "بني مسوس، الجزائر" },
        { name: "مستشفى الدويرة", lat: 36.7222, lng: 3.2097, phone: "023 41 43 43", address: "الدويرة، الجزائر" },
        { name: "مستشفى باب الواد", lat: 36.7892, lng: 3.0575, phone: "023 41 44 44", address: "باب الواد، الجزائر" }
    ],
    police: [
        { name: "مركز الشرطة - القبة", lat: 36.7392, lng: 3.0708, phone: "017 71 71 71", address: "القبة، الجزائر" },
        { name: "مركز الشرطة - الحراش", lat: 36.7064, lng: 3.1808, phone: "017 71 72 72", address: "الحراش، الجزائر" },
        { name: "مركز الشرطة - بولوغين", lat: 36.7553, lng: 2.9975, phone: "017 71 73 73", address: "بولوغين، الجزائر" }
    ],
    military: [
        { name: "فرقة الدرك - بني مسوس", lat: 36.7281, lng: 3.0281, phone: "021 71 15 15", address: "بني مسوس، الجزائر" },
        { name: "فرقة الدرك - الحراش", lat: 36.7153, lng: 3.1667, phone: "021 71 16 16", address: "الحراش، الجزائر" }
    ],
    civilDefense: [
        { name: "وحدة الحماية المدنية - القبة", lat: 36.7469, lng: 3.0764, phone: "014 14 14 14", address: "القبة، الجزائر" },
        { name: "وحدة الحماية المدنية - باب الواد", lat: 36.7950, lng: 3.0500, phone: "014 14 14 15", address: "باب الواد، الجزائر" },
        { name: "وحدة الحماية المدنية - الدويرة", lat: 36.7167, lng: 3.2000, phone: "014 14 14 16", address: "الدويرة، الجزائر" }
    ],
    pharmacy: [
        { name: "صيدلية الشفاء", lat: 36.7538, lng: 3.0588, phone: "023 41 41 41", address: "الجزائر العاصمة" },
        { name: "صيدلية الحياة", lat: 36.7550, lng: 3.0600, phone: "023 41 42 42", address: "بني مسوس، الجزائر" },
        { name: "صيدلية الأمل", lat: 36.7222, lng: 3.2097, phone: "023 41 43 43", address: "الدويرة، الجزائر" },
        { name: "صيدلية النجاح", lat: 36.7510, lng: 3.0550, phone: "023 41 44 44", address: "باب الواد، الجزائر" }
    ],
    laboratories: [ // تم تغيير الاسم من Laboratory إلى laboratories ليكون متسقاً مع بقية الأسماء
        { name: "مختبر النور", lat: 36.7538, lng: 3.0588, phone: "023 41 41 41", address: "الجزائر العاصمة" },
        { name: "مختبر المستقبل", lat: 36.7550, lng: 3.0600, phone: "023 41 42 42", address: "بني مسوس، الجزائر" },
        { name: "مختبر بومرداس", lat: 36.7222, lng: 3.2097, phone: "023 41 43 43", address: "الدويرة، الجزائر" },
        { name: "مختبر التحاليل البيولوجية", lat: 36.7510, lng: 3.0550, phone: "023 41 44 44", address: "باب الواد، الجزائر" }
    ]
};

// وظيفة حساب المسافة بين نقطتين (صيغة هافرسين)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // نصف قطر الأرض بالكيلومترات
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Reverse Geocoding تحويل الإحداثيات إلى اسم مدينة / ولاية / دولة
async function getAddressFromCoordinates(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
        );

        const data = await response.json();

        if (data && data.address) {
            const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.municipality ||
                '';

            const state = data.address.state || '';
            const country = data.address.country || '';

            return [city, state, country].filter(Boolean).join('، ');
        }

        return '';
    } catch (error) {
        console.error('خطأ في جلب اسم الموقع:', error);
        return '';
    }
}

// وظيفة لتحديد أقرب الخدمات
function findNearestServices(userLat, userLng) {
    const nearestServices = {
        hospitals: [],
        police: [],
        military: [],
        civilDefense: [],
        pharmacy: [],
        laboratories: [] // تم التصحيح هنا
    };

    // لكل نوع خدمة، نحسب المسافة ونرتبها
    for (const serviceType in serviceLocations) {
        const services = serviceLocations[serviceType].map(service => {
            const distance = calculateDistance(userLat, userLng, service.lat, service.lng);
            return { ...service, distance };
        });

        // ترتيب حسب المسافة (الأقرب أولاً)
        services.sort((a, b) => a.distance - b.distance);

        // أخذ أقرب 3 خدمات
        nearestServices[serviceType] = services.slice(0, 3);
    }

    return nearestServices;
}

// وظيفة لعرض الخدمات في القوائم
function displayServices(services) {
    const hospitalsList = document.getElementById('hospitalsList');
    const policeList = document.getElementById('policeList');
    const militaryList = document.getElementById('militaryList');
    const civilDefenseList = document.getElementById('civilDefenseList');
    const pharmacyList = document.getElementById('pharmacyList');
    const laboratoriesList = document.getElementById('laboratoriesList'); // تم التصحيح

    hospitalsList.innerHTML = '';
    policeList.innerHTML = '';
    militaryList.innerHTML = '';
    civilDefenseList.innerHTML = '';
    pharmacyList.innerHTML = '';
    laboratoriesList.innerHTML = '';

    // المستشفيات
    services.hospitals.forEach((hospital, index) => {
        const item = document.createElement('div');
        item.className = 'service-item';

        if (index === 0) {
            item.classList.add('nearest');
        }

        item.innerHTML = `
            <span>${hospital.name}</span>
            <span class="distance">${hospital.distance.toFixed(1)} كم</span>
        `;

        item.addEventListener('click', () => showRouteToService(hospital));
        hospitalsList.appendChild(item);
    });

    // الشرطة
    services.police.forEach((police, index) => {
        const item = document.createElement('div');
        item.className = 'service-item';

        if (index === 0) {
            item.classList.add('nearest');
        }

        item.innerHTML = `
            <span>${police.name}</span>
            <span class="distance">${police.distance.toFixed(1)} كم</span>
        `;

        item.addEventListener('click', () => showRouteToService(police));
        policeList.appendChild(item);
    });

    // الدرك
    services.military.forEach((military, index) => {
        const item = document.createElement('div');
        item.className = 'service-item';

        if (index === 0) {
            item.classList.add('nearest');
        }

        item.innerHTML = `
            <span>${military.name}</span>
            <span class="distance">${military.distance.toFixed(1)} كم</span>
        `;

        item.addEventListener('click', () => showRouteToService(military));
        militaryList.appendChild(item);
    });

    // الحماية المدنية
    services.civilDefense.forEach((civil, index) => {
        const item = document.createElement('div');
        item.className = 'service-item';

        if (index === 0) {
            item.classList.add('nearest');
        }

        item.innerHTML = `
            <span>${civil.name}</span>
            <span class="distance">${civil.distance.toFixed(1)} كم</span>
        `;
        item.addEventListener('click', () => showRouteToService(civil));
        civilDefenseList.appendChild(item);
    });

    // صيدليات
    services.pharmacy.forEach((pharmacy, index) => {
        const item = document.createElement('div');
        item.className = 'service-item';

        if (index === 0) {
            item.classList.add('nearest');
        }

        item.innerHTML = `
            <span>${pharmacy.name}</span>
            <span class="distance">${pharmacy.distance.toFixed(1)} كم</span>
        `;

        item.addEventListener('click', () => showRouteToService(pharmacy));
        pharmacyList.appendChild(item);
    });

    // مختبرات
    services.laboratories.forEach((laboratory, index) => { // تم التصحيح
        const item = document.createElement('div');
        item.className = 'service-item';

        if (index === 0) {
            item.classList.add('nearest');
        }

        item.innerHTML = `
            <span>${laboratory.name}</span>
            <span class="distance">${laboratory.distance.toFixed(1)} كم</span>
        `;

        item.addEventListener('click', () => showRouteToService(laboratory));
        laboratoriesList.appendChild(item); // تم التصحيح
    });
}

// وظيفة إضافة العلامات على الخريطة
function addMarkersToMap(services) {
    // إزالة العلامات القديمة ما عدا علامة المستخدم
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer !== userMarker) {
            map.removeLayer(layer);
        }
    });

    // إضافة علامات للمستشفيات
    services.hospitals.forEach(hospital => {
        L.marker([hospital.lat, hospital.lng], {
            icon: L.divIcon({
                html: `<i class="fas fa-hospital" style="color:var(--hospital-color);font-size:20px;"></i>`,
                iconSize: [20, 20],
                className: 'hospital-marker'
            })
        })
            .addTo(map)
            .bindPopup(`<b>${hospital.name}</b><br>${hospital.address}<br>الهاتف: ${hospital.phone}<br>المسافة: ${hospital.distance.toFixed(1)} كم`);
    });

    // إضافة علامات لمراكز الشرطة
    services.police.forEach(police => {
        L.marker([police.lat, police.lng], {
            icon: L.divIcon({
                html: '<i class="fas fa-shield-alt" style="color: #1d3557; font-size: 20px;"></i>',
                iconSize: [20, 20],
                className: 'police-marker'
            })
        })
            .addTo(map)
            .bindPopup(`<b>${police.name}</b><br>${police.address}<br>الهاتف: ${police.phone}<br>المسافة: ${police.distance.toFixed(1)} كم`);
    });

    // إضافة علامات لمراكز الدرك
    services.military.forEach(military => {
        L.marker([military.lat, military.lng], {
            icon: L.divIcon({
                html: '<i class="fas fa-star" style="color: #555; font-size: 20px;"></i>',
                iconSize: [20, 20],
                className: 'military-marker'
            })
        })
            .addTo(map)
            .bindPopup(`<b>${military.name}</b><br>${military.address}<br>الهاتف: ${military.phone}<br>المسافة: ${military.distance.toFixed(1)} كم`);
    });

    // الحماية المدنية
    services.civilDefense.forEach(civilDefense => {
        L.marker([civilDefense.lat, civilDefense.lng], {
            icon: L.divIcon({
                html: `<i class="fas fa-fire-extinguisher" style="color:var(--civil-defense-color);font-size:20px;"></i>`,
                iconSize: [20, 20],
                className: 'civil-defense-marker'
            })
        })
            .addTo(map)
            .bindPopup(`<b>${civilDefense.name}</b><br>${civilDefense.address}<br>الهاتف: ${civilDefense.phone}<br>المسافة: ${civilDefense.distance.toFixed(1)} كم`);
    });

    // إضافة علامات للصيدليات
    services.pharmacy.forEach(pharmacy => {
        L.marker([pharmacy.lat, pharmacy.lng], {
            icon: L.divIcon({
                html: `<i class="fas fa-capsules" style="color:var(--pharmacy-color);font-size:20px;"></i>`,
                iconSize: [20, 20],
                className: 'pharmacy-marker'
            })
        })
            .addTo(map)
            .bindPopup(`<b>${pharmacy.name}</b><br>${pharmacy.address}<br>الهاتف: ${pharmacy.phone}<br>المسافة: ${pharmacy.distance.toFixed(1)} كم`);
    });

    // إضافة علامات للمختبرات البيولوجية - تم التصحيح
    services.laboratories.forEach(laboratory => {
        L.marker([laboratory.lat, laboratory.lng], {
            icon: L.divIcon({
                html: `<i class="fas fa-vial" style="color:var(--laboratory-color);font-size:20px;"></i>`,
                iconSize: [20, 20],
                className: 'laboratory-marker' // تم التصحيح
            })
        })
            .addTo(map)
            .bindPopup(`<b>${laboratory.name}</b><br>${laboratory.address}<br>الهاتف: ${laboratory.phone}<br>المسافة: ${laboratory.distance.toFixed(1)} كم`);
    });
}

// وظيفة تحديد موقع المستخدم
document.getElementById('getLocation').addEventListener('click', () => {
    const status = document.getElementById('locationStatus');
    const button = document.getElementById('getLocation');

    // تعطيل الزر وإظهار التحميل
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تحديد الموقع...';

    status.textContent = 'جاري تحديد موقعك...';
    status.style.color = '#ffdddd';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                userLocation = { lat: userLat, lng: userLng };

                const coordsText = `تم تحديد موقعك: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
                status.textContent = coordsText;
                status.style.color = '#aaffaa';

                // جلب اسم المدينة
                getAddressFromCoordinates(userLat, userLng).then(address => {
                    if (address) {
                        status.innerHTML = `
                            ${coordsText}<br>
                            ${address}
                        `;
                    }
                });

                if (userMarker) {
                    map.removeLayer(userMarker);
                }

                userMarker = L.marker([userLat, userLng], {
                    icon: L.divIcon({
                        html: '<i class="fas fa-user" style="color: #2a9d8f; font-size: 24px;"></i>',
                        iconSize: [24, 24],
                        className: 'user-marker'
                    })
                }).addTo(map).bindPopup('<b>موقعك الحالي</b>');

                map.setView([userLat, userLng], 13);

                const nearestServices = findNearestServices(userLat, userLng);

                displayServices(nearestServices);
                addMarkersToMap(nearestServices);

                // إعادة الزر لوضعه الطبيعي
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-map-marker-alt"></i> تحديد موقعي الحالي';
            },
            (error) => {
                let errorMessage = 'فشل تحديد الموقع. ';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'تم رفض إذن الموقع.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'معلومات الموقع غير متاحة.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'انتهت مهلة طلب الموقع.';
                        break;
                    default:
                        errorMessage += 'حدث خطأ غير معروف.';
                }

                status.textContent = errorMessage;
                status.style.color = '#ffaaaa';

                userLocation = { lat: 36.7525, lng: 3.0418 };

                const nearestServices = findNearestServices(userLocation.lat, userLocation.lng);
                displayServices(nearestServices);
                addMarkersToMap(nearestServices);

                // إعادة الزر لوضعه الطبيعي
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-map-marker-alt"></i> تحديد موقعي الحالي';
            }
        );
    } else {
        status.textContent = 'المتصفح لا يدعم تحديد الموقع الجغرافي';
        status.style.color = '#ffaaaa';

        button.disabled = false;
        button.innerHTML = '<i class="fas fa-map-marker-alt"></i> تحديد موقعي الحالي';
    }
});

// وظيفة عرض جميع الخدمات
document.getElementById('showAllServices').addEventListener('click', () => {
    if (!userLocation) {
        alert('الرجاء تحديد موقعك أولاً');
        return;
    }

    // جمع جميع الخدمات
    const allServices = {
        hospitals: serviceLocations.hospitals.map(h => ({
            ...h,
            distance: calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng)
        })),
        police: serviceLocations.police.map(p => ({
            ...p,
            distance: calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
        })),
        military: serviceLocations.military.map(m => ({
            ...m,
            distance: calculateDistance(userLocation.lat, userLocation.lng, m.lat, m.lng)
        })),
        civilDefense: serviceLocations.civilDefense.map(c => ({
            ...c,
            distance: calculateDistance(userLocation.lat, userLocation.lng, c.lat, c.lng)
        })),
        pharmacy: serviceLocations.pharmacy.map(h => ({
            ...h,
            distance: calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng)
        })),
        laboratories: serviceLocations.laboratories.map(h => ({ // تم التصحيح
            ...h,
            distance: calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng)
        })),
    };

    // عرض جميع الخدمات
    displayServices(allServices);

    // إضافة جميع العلامات على الخريطة
    addMarkersToMap(allServices);

    // تكبير الخريطة لتناسب جميع العلامات
    const allPoints = [
        ...allServices.hospitals,
        ...allServices.police,
        ...allServices.military,
        ...allServices.civilDefense,
        ...allServices.pharmacy,
        ...allServices.laboratories // تم التصحيح
    ].map(s => [s.lat, s.lng]);

    if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        if (userMarker) {
            bounds.extend([userLocation.lat, userLocation.lng]);
        }
        map.fitBounds(bounds);
    }
});

// وظيفة عرض مسار إلى الخدمة
function showRouteToService(service) {
    if (!userLocation) {
        alert('الرجاء تحديد موقعك أولاً');
        return;
    }

    const modal = document.getElementById('routeModal');
    const routeTitle = document.getElementById('routeTitle');
    const routeDetails = document.getElementById('routeDetails');

    routeTitle.textContent = service.name;

    const googleMapsUrl =
        `https://www.google.com/maps/dir/?api=1` +
        `&origin=${userLocation.lat},${userLocation.lng}` +
        `&destination=${service.lat},${service.lng}` +
        `&travelmode=driving`;

    routeDetails.innerHTML = `
        <p><strong>العنوان:</strong> ${service.address}</p>
        <p><strong>الهاتف:</strong> ${service.phone}</p>
        <a href="${googleMapsUrl}" target="_blank" class="google-route-btn">
            التنقل عبر Google Maps
        </a>
    `;

    modal.style.display = 'flex';

    setTimeout(() => {
        if (!miniMap) {
            miniMap = L.map('miniMap', {
                zoomControl: false,
                attributionControl: false
            });
        }

        miniMap.setView([service.lat, service.lng], 14);

        if (!miniMap._layersInitialized) {
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
                .addTo(miniMap);
            miniMap._layersInitialized = true;
        }

        // حذف ماركر قديم
        if (miniMarker) miniMap.removeLayer(miniMarker);

        miniMarker = L.marker([service.lat, service.lng]).addTo(miniMap);

        // حذف خط قديم
        if (miniRouteLine) miniMap.removeLayer(miniRouteLine);

        // إنشاء خط بين المستخدم والوجهة
        miniRouteLine = L.polyline(
            [
                [userLocation.lat, userLocation.lng],
                [service.lat, service.lng]
            ],
            {
                color: '#1a73e8',
                weight: 4,
                opacity: 0.8
            }
        ).addTo(miniMap);

        // ضبط عرض الخريطة ليشمل النقطتين
        const bounds = L.latLngBounds([
            [userLocation.lat, userLocation.lng],
            [service.lat, service.lng]
        ]);

        miniMap.fitBounds(bounds, { padding: [30, 30] });

        miniMap.invalidateSize();
    }, 200);
}

// وظيفة اتصال الطوارئ
const emergencyBtn = document.getElementById('emergencyCall');
if (emergencyBtn) {
    emergencyBtn.addEventListener('click', () => {
        const emergencyNumber = '14'; // رقم الحماية المدنية في الجزائر
        const confirmCall = confirm(`هل تريد الاتصال برقم الطوارئ ${emergencyNumber}؟`);
        if (confirmCall) {
            window.location.href = `tel:${emergencyNumber}`;
        }
    });
}

// إغلاق النافذة
document.addEventListener("click", function (e) {
    const modal = document.getElementById("routeModal");

    if (e.target.closest(".close-modal")) {
        modal.style.display = "none";
    }

    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// تهيئة الخريطة ببعض البيانات الافتراضية عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    const defaultLocation = { lat: 36.7525, lng: 3.0418 };
    const nearestServices = findNearestServices(defaultLocation.lat, defaultLocation.lng);
    addMarkersToMap(nearestServices);
});