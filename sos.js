// تهيئة الخريطة
let map = L.map('map').setView([36.7525, 3.0418], 10); // إحداثيات الجزائر العاصمة
let userMarker = null;
let userLocation = null;
let miniMap = null;
let miniMarker = null;
let miniRouteLine = null;
let miniRoutingControl = null;


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
        { name: "مركز الشرطة - بولوغين", lat: 36.7553, lng: 2.9975, phone: "017 71 73 73", address: "بولوغين، الجزائر" },
                { name: "أمن ولاية تيميمون", lat: 29.2639, lng: 0.2300, phone: "049300366", address: "طريق فلسطين، تيميمون" },
        { name: "أمن ولاية برج باجي مختار", lat: 21.3278, lng: 0.9539, phone: "049326702", address: "طريق تمنراست، أمام مقر الولاية، برج باجي مختار" },
        { name: "أمن ولاية أولاد جلال", lat: 34.4167, lng: 5.0667, phone: "033666670", address: "طريق العربي بن مهيدي، أولاد جلال" },
        { name: "أمن ولاية بني عباس", lat: 30.1333, lng: -2.1667, phone: "049285330", address: "شارع فلسطين، بني عباس" },
        { name: "أمن ولاية إن صالح", lat: 27.2000, lng: 2.4833, phone: "029365551", address: "وسط مدينة إن صالح" },
        { name: "أمن ولاية إن قزام", lat: 19.5667, lng: 5.7500, phone: "029354132", address: "وسط مدينة إن قزام" },
        { name: "أمن ولاية توقرت", lat: 33.1053, lng: 6.0574, phone: "029663935", address: "ساحة الحرية، بلدية توقرت" },
        { name: "أمن ولاية جانت", lat: 24.5542, lng: 9.4847, phone: "029480442", address: "حي إفري، جانت" },
        { name: "أمن ولاية المغير", lat: 33.9500, lng: 5.9167, phone: "032186547", address: "حي السعادة، المغير" },
        { name: "أمن ولاية المنيعة", lat: 30.5833, lng: 2.8833, phone: "029212030", address: "طريق العربي بن مهيدي، المنيعة" },
        { name: "أمن ولاية أدرار", lat: 27.8743, lng: -0.2939, phone: "049361020", address: "حي عيسات إدير، أدرار" },
        { name: "أمن ولاية الشلف", lat: 36.1653, lng: 1.3345, phone: "027771000", address: "طريق محمد طويل، الشلف" },
        { name: "أمن ولاية الأغواط", lat: 33.8076, lng: 2.8651, phone: "029152124", address: "طريق محمد رزوق، المعمورة، الأغواط" }, 
        { name: "أمن ولاية أم البواقي", lat: 35.8754, lng: 7.1135, phone: "032521409", address: "نهج هواري بومدين، أم البواقي" },
        { name: "أمن ولاية باتنة", lat: 35.5559, lng: 6.1741, phone: "033857944", address: "حي المجزرة، باتنة" },
        { name: "أمن ولاية بجاية", lat: 36.7525, lng: 5.0556, phone: "034163646", address: "حي حرفي طاووس، بجاية" },
        { name: "أمن ولاية بسكرة", lat: 34.8515, lng: 5.7280, phone: "033502008", address: "طريق 08 مارس، بسكرة" },
        { name: "أمن ولاية بشار", lat: 31.6167, lng: -2.2167, phone: "049244902", address: "طريق طالب عبد الله، بشار" },
        { name:"أمن ولاية البليدة",lat:36.4700,lng:2.8330,phone:"025237927",address:"طريق بن قاسم أوزري، البليدة" },
        { name: "أمن ولاية البويرة", lat: 36.3800, lng: 3.9000, phone: "026727701", address: "طريق 20 أوت 1955، البويرة" },
        { name: "أمن ولاية تمنراست", lat: 22.7850, lng: 5.5228, phone: "029318032", address: "حي أمشون، تمنراست" },
        { name: "أمن ولاية تبسة", lat: 35.4042, lng: 8.1242, phone: "037510031", address: "طريق الشريطين الشهداء، تبسة" },
        { name: "أمن ولاية تلمسان", lat: 34.8828, lng: -1.3167, phone: "043417905", address: "طريق باستور، تلمسان" },
        { name: "أمن ولاية تيارت", lat: 35.3710, lng: 1.3160, phone: "046203504", address: "طريق السوفر، تيارت" },
        { name: "أمن ولاية تيزي وزو", lat: 36.7169, lng: 4.0497, phone: "026194930", address: "طريق العربي بن مهيدي، تيزي وزو" },
        { name: "أمن ولاية الجزائر", lat: 36.7538, lng: 3.0588, phone: "023498200", address: "شارع العقيد عميروش، الجزائر" },
        { name: "أمن ولاية الجلفة", lat: 34.6728, lng: 3.2630, phone: "027908701", address: "طريق الجامعة، زيان عاشور، الجلفة" },
        { name: "أمن ولاية جيجل", lat: 36.8200, lng: 5.7667, phone: "034472046", address: "شارع الصومام، جيجل" },
        { name: "أمن ولاية سطيف", lat: 36.1900, lng: 5.4100, phone: "036441533", address: "شارع الشيخ العيفة، سطيف" },
        { name: "أمن ولاية سعيدة", lat: 34.8300, lng: 0.1517, phone: "048428912", address: "طريق الإخوة فاطمي، سعيدة" },
        { name: "أمن ولاية سكيكدة", lat: 36.8762, lng: 6.9092, phone: "038756805", address: "طريق 20 أوت 1955، سكيكدة" },
        { name: "أمن ولاية سيدي بلعباس", lat: 35.1900, lng: -0.6300, phone: "048711309", address: "شارع ميصالي الحاج، سيدي بلعباس" },
        { name: "أمن ولاية عنابة", lat: 36.9000, lng: 7.7667, phone: "038402500", address: "طريق شنانفي محمد، عنابة" },
        { name: "أمن ولاية قالمة", lat: 36.4621, lng: 7.4337, phone: "037260630", address: "طريق مجلدي محمد، قالمة" },
        { name: "أمن ولاية قسنطينة", lat: 36.3650, lng: 6.6147, phone: "031926481", address: "طريق عمار حمّو، قسنطينة" },
        { name: "أمن ولاية المدية", lat: 36.2642, lng: 2.7539, phone: "025734907", address: "طريق جيش التحرير الوطني، المدية" },
        { name: "أمن ولاية مستغانم", lat: 35.9311, lng: 0.0892, phone: "045352837", address: "نهج بن يحي بلقاسم، مستغانم" },
        { name: "أمن ولاية المسيلة", lat: 35.7058, lng: 4.5419, phone: "035350100", address: "طريق شريد عبد الحفيظ، المسيلة" },
        { name: "أمن ولاية معسكر", lat: 35.3966, lng: 0.1403, phone: "045753510", address: "طريق الشهيد مصطفى الوالي، معسكر" },
        { name: "أمن ولاية ورقلة", lat: 31.9556, lng: 5.3411, phone: "029600061", address: "منطقة النشاطات، بجانب الوحدة المركزية للحماية المدنية، ورقلة" },
        { name: "أمن ولاية وهران", lat: 35.6971, lng: -0.6308, phone: "041242880", address: "شارع جيش التحرير الوطني، وهران" },
        { name: "أمن ولاية البيض", lat: 33.6843, lng: 1.0193, phone: "049614001", address: "طريق الهواري الحاج براهم، البيض" },
        { name: "أمن ولاية إليزي", lat: 26.4833, lng: 8.4667, phone: "029411071", address: "القطاع الحضري الجديد، إليزي" },
        { name: "أمن ولاية برج بوعريريج", lat: 36.0732, lng: 4.7611, phone: "035722913", address: "نهج الجمهورية، برج بوعريريج" },
        { name: "أمن ولاية بومرداس", lat: 36.7667, lng: 3.4667, phone: "024949412", address: "حي 20 أوت، بومرداس" },
        { name: "أمن ولاية الطارف", lat: 36.7672, lng: 8.3138, phone: "038301401", address: "الطريق الوطني رقم 44، الطارف" },
        { name: "أمن ولاية تندوف", lat: 27.6711, lng: -8.1474, phone: "049372902", address: "حي موساني، تندوف" },
        { name: "أمن ولاية تيسمسيلت", lat: 35.6072, lng: 1.8108, phone: "046575530", address: "شارع 24 فيفري، تيسمسيلت" },
        { name: "أمن ولاية الوادي", lat: 33.3683, lng: 6.8674, phone: "032112904", address: "حي المجاهدين، الوادي" }
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


// الصعوود للأعلى

        const scrollBtn = document.getElementById("scrollTopBtn");

        window.addEventListener("scroll", function () {
            if (window.pageYOffset > 300) {
                scrollBtn.style.display = "block";
            } else {
                scrollBtn.style.display = "none";
            }
        });

        scrollBtn.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
