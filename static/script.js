let monitoring = false;

// Save contact
async function saveContact() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    const res = await fetch('/add_contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, phone})
    });

    const data = await res.json();
    document.getElementById('status').innerText = data.message;
}

// GPS location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendPosition);
    } else {
        alert('Geolocation is not supported');
    }
}

async function sendPosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const res = await fetch('/send_location', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({latitude: lat, longitude: lng})
    });

    const data = await res.json();

    document.getElementById('status').innerHTML =
        '<b>Latitude:</b> ' + lat +
        '<br><b>Longitude:</b> ' + lng +
        '<br><b>Server:</b> ' + data.message;
}

// AI prediction using sensor values
async function predictAccident(accValue){

    const sensorData = {
        acc: accValue,
        gyro: accValue/2,
        speed_drop: accValue,
        no_motion: accValue > 35 ? 1 : 0
    };

    const res = await fetch('/predict_accident', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(sensorData)
    });

    const result = await res.json();

    if(result.accident){
        startEmergencyCountdown(result.probability);
    }
}
async function requestSensorPermission() {

    // iPhone / some browsers require permission
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {

        try {
            const response = await DeviceMotionEvent.requestPermission();

            if (response === 'granted') {
                startSensorMonitoring();
            } else {
                alert('Motion sensor permission denied');
            }

        } catch (e) {
            alert('Permission error: ' + e);
        }

    } else {
        // Android Chrome usually comes here
        startSensorMonitoring();
    }
}

// Start monitoring phone sensors
function startSensorMonitoring(){

    if(monitoring){
        alert('Sensor monitoring already running');
        return;
    }

    monitoring = true;
    alert('Move or shake your phone to test accident detection');

    window.addEventListener('devicemotion', handleMotion);
}

function handleMotion(event){

    const x = event.accelerationIncludingGravity.x || 0;
    const y = event.accelerationIncludingGravity.y || 0;
    const z = event.accelerationIncludingGravity.z || 0;

    const impact = Math.sqrt(x*x + y*y + z*z);

    document.getElementById('accValue').innerText = impact.toFixed(2);

    if(impact > 35){

        document.getElementById('impactStatus').innerText = '⚠ High Impact Detected';
        document.getElementById('impactStatus').style.color = '#f87171';

        predictAccident(impact);

    }else{

        document.getElementById('impactStatus').innerText = 'Normal';
        document.getElementById('impactStatus').style.color = '#22c55e';
    }
}

// 15 second countdown
function startEmergencyCountdown(probability){

    let timeLeft = 15;

    const cancel = confirm(
        '🚨 Possible accident detected! Probability: ' +
        probability +
        '\\nPress OK if you are SAFE.\\nPress Cancel to continue emergency alert.'
    );

    if(cancel){
        alert('Emergency alert cancelled by user.');
        return;
    }

    const interval = setInterval(()=>{

        document.getElementById('status').innerHTML =
            '<b>🚨 Emergency Alert in:</b> ' + timeLeft + ' seconds';

        timeLeft--;

        if(timeLeft < 0){
            clearInterval(interval);

            document.getElementById('status').innerHTML =
                '<b>🚑 Emergency Alert Sent Automatically!</b>';

            getLocation();
        }

    },1000);
}
let monitoring = false;

function requestSensorPermission() {
    startSensorMonitoring();
}

function startSensorMonitoring(){

    if(monitoring){
        alert('Monitoring already running');
        return;
    }

    monitoring = true;

    alert('Sensor monitoring started. Shake the phone.');

    window.addEventListener('devicemotion', handleMotion, true);
}

function handleMotion(event){

    let x = 0, y = 0, z = 0;

    if(event.accelerationIncludingGravity){
        x = event.accelerationIncludingGravity.x || 0;
        y = event.accelerationIncludingGravity.y || 0;
        z = event.accelerationIncludingGravity.z || 0;
    }

    const impact = Math.sqrt(x*x + y*y + z*z);

    document.getElementById('accValue').innerText = impact.toFixed(2);

    if(impact > 15){

        document.getElementById('impactStatus').innerText =
            '⚠ High Impact Detected';

        document.getElementById('impactStatus').style.color = '#f87171';

    }else{

        document.getElementById('impactStatus').innerText = 'Normal';
        document.getElementById('impactStatus').style.color = '#22c55e';
    }

    console.log('Impact:', impact);
}
// Demo sensor simulation for project presentation
let demoRunning = false;

function requestSensorPermission() {
    startSensorMonitoring();
}

function startSensorMonitoring(){

    if(demoRunning){
        alert('Sensor demo already running');
        return;
    }

    demoRunning = true;

    alert('Sensor demo started. Watch the acceleration values.');

    let count = 0;

    const interval = setInterval(async ()=>{

        count++;

        // Generate realistic acceleration values
        let impact;

        if(count < 5){
            impact = (9 + Math.random()*3).toFixed(2); // normal
        }else if(count < 8){
            impact = (15 + Math.random()*10).toFixed(2); // movement
        }else{
            impact = (35 + Math.random()*15).toFixed(2); // accident impact
        }

        document.getElementById('accValue').innerText = impact;

        if(impact > 30){

            document.getElementById('impactStatus').innerText =
                '⚠ High Impact Detected';

            document.getElementById('impactStatus').style.color = '#f87171';

            // Call AI prediction
            await predictAccident(parseFloat(impact));

            clearInterval(interval);

        }else{

            document.getElementById('impactStatus').innerText = 'Normal';
            document.getElementById('impactStatus').style.color = '#22c55e';
        }

    },1000);
}
// ================= FREE LEAFLET MAP =================

let map;

// Page load hone par map start hoga
window.onload = function () {
    initMap();
};

function initMap() {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(position => {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Map create
            map = L.map('map').setView([lat, lng], 14);

            // OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // User location marker
            L.marker([lat, lng])
                .addTo(map)
                .bindPopup('📍 Your Current Location')
                .openPopup();

            // Demo nearby hospitals
            const hospitals = [
                {
                    name: 'City Hospital',
                    lat: lat + 0.005,
                    lng: lng + 0.005
                },
                {
                    name: 'Metro Care Hospital',
                    lat: lat - 0.004,
                    lng: lng + 0.003
                },
                {
                    name: 'Emergency Medical Center',
                    lat: lat + 0.003,
                    lng: lng - 0.004
                }
            ];

            let html = '<h3 style="margin-bottom:15px;">🏥 Nearby Hospitals</h3>';

            hospitals.forEach((hospital, index) => {

                // Hospital marker
                L.marker([hospital.lat, hospital.lng])
                    .addTo(map)
                    .bindPopup(hospital.name);

                html += `
                    <div style="
                        background:rgba(255,255,255,0.08);
                        border:1px solid rgba(255,255,255,0.12);
                        padding:15px;
                        border-radius:14px;
                        margin-bottom:12px;
                    ">

                        <b>${index + 1}. ${hospital.name}</b><br>

                        <a href="https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}"
                           target="_blank"
                           style="
                               display:inline-block;
                               background:#2563eb;
                               color:white;
                               padding:10px 14px;
                               border-radius:10px;
                               text-decoration:none;
                               font-weight:600;
                               margin-top:10px;
                           ">
                           🧭 Navigate
                        </a>
                    </div>
                `;
            });

            document.getElementById('hospitalList').innerHTML = html;

        }, error => {

            alert('Location permission denied');

        });

    } else {

        alert('Geolocation not supported in this browser');

    }
}