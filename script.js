// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('section');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active-section'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active-section');
    });
});

// Audio
const alarmSound = document.getElementById('alarm-sound');
function playAlarm() {
    alarmSound.currentTime = 0;
    alarmSound.play().catch(e => console.log("Audio play failed:", e));
}

// Clock
function updateClock() {
    const now = new Date();
    const timeDisplay = document.getElementById('main-time');
    const dateDisplay = document.getElementById('main-date');
    
    timeDisplay.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    dateDisplay.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
    
    checkAlarms(now);
}
setInterval(updateClock, 1000);
updateClock();

// Timer
let timerInterval;
let timerTime = 0;
const timerDisplay = document.getElementById('timer-time');
const timerStartBtn = document.getElementById('timer-start');
const timerResetBtn = document.getElementById('timer-reset');
const timerInputs = {
    h: document.getElementById('timer-hours'),
    m: document.getElementById('timer-minutes'),
    s: document.getElementById('timer-seconds')
};

function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

timerStartBtn.addEventListener('click', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerStartBtn.textContent = 'START';
        return;
    }

    if (timerTime === 0) {
        const h = parseInt(timerInputs.h.value) || 0;
        const m = parseInt(timerInputs.m.value) || 0;
        const s = parseInt(timerInputs.s.value) || 0;
        timerTime = h * 3600 + m * 60 + s;
    }

    if (timerTime > 0) {
        timerStartBtn.textContent = 'PAUSE';
        timerDisplay.textContent = formatTime(timerTime);
        
        timerInterval = setInterval(() => {
            timerTime--;
            timerDisplay.textContent = formatTime(timerTime);
            
            if (timerTime <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerStartBtn.textContent = 'START';
                playAlarm();
                alert('Timer Finished!');
            }
        }, 1000);
    }
});

timerResetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerTime = 0;
    timerStartBtn.textContent = 'START';
    timerDisplay.textContent = '00:00:00';
    timerInputs.h.value = '';
    timerInputs.m.value = '';
    timerInputs.s.value = '';
});

// Stopwatch
let stopwatchInterval;
let stopwatchStartTime;
let stopwatchElapsedTime = 0;
const stopwatchDisplay = document.getElementById('stopwatch-time');
const stopwatchStartBtn = document.getElementById('stopwatch-start');
const stopwatchLapBtn = document.getElementById('stopwatch-lap');
const stopwatchResetBtn = document.getElementById('stopwatch-reset');
const lapsContainer = document.getElementById('stopwatch-laps');

function formatStopwatch(ms) {
    const date = new Date(ms);
    const m = String(date.getUTCHours() * 60 + date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    const msStr = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
    return `${m}:${s}<span class="milliseconds">.${msStr}</span>`;
}

stopwatchStartBtn.addEventListener('click', () => {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchStartBtn.textContent = 'START';
        stopwatchLapBtn.disabled = true;
    } else {
        stopwatchStartTime = Date.now() - stopwatchElapsedTime;
        stopwatchInterval = setInterval(() => {
            stopwatchElapsedTime = Date.now() - stopwatchStartTime;
            stopwatchDisplay.innerHTML = formatStopwatch(stopwatchElapsedTime);
        }, 10);
        stopwatchStartBtn.textContent = 'STOP';
        stopwatchLapBtn.disabled = false;
    }
});

stopwatchResetBtn.addEventListener('click', () => {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchElapsedTime = 0;
    stopwatchDisplay.innerHTML = '00:00<span class="milliseconds">.00</span>';
    stopwatchStartBtn.textContent = 'START';
    stopwatchLapBtn.disabled = true;
    lapsContainer.innerHTML = '';
});

stopwatchLapBtn.addEventListener('click', () => {
    const lapTime = formatStopwatch(stopwatchElapsedTime);
    const lapEl = document.createElement('div');
    lapEl.className = 'lap-item';
    lapEl.innerHTML = `Lap ${lapsContainer.children.length + 1}: ${lapTime}`;
    lapsContainer.prepend(lapEl);
});

// Alarm
const alarms = [];
const alarmInput = document.getElementById('alarm-input');
const alarmLabel = document.getElementById('alarm-label');
const alarmAddBtn = document.getElementById('alarm-add');
const alarmsList = document.getElementById('alarms-list');

alarmAddBtn.addEventListener('click', () => {
    const time = alarmInput.value;
    if (!time) return;
    
    const alarm = {
        id: Date.now(),
        time: time,
        label: alarmLabel.value || 'Alarm',
        enabled: true
    };
    
    alarms.push(alarm);
    renderAlarms();
    alarmInput.value = '';
    alarmLabel.value = '';
});

function renderAlarms() {
    alarmsList.innerHTML = '';
    alarms.forEach(alarm => {
        const el = document.createElement('div');
        el.className = 'alarm-item';
        el.innerHTML = `
            <div>
                <span class="alarm-time">${alarm.time}</span>
                <span class="alarm-label">${alarm.label}</span>
            </div>
            <button class="delete-alarm" onclick="deleteAlarm(${alarm.id})">✕</button>
        `;
        alarmsList.appendChild(el);
    });
}

window.deleteAlarm = (id) => {
    const idx = alarms.findIndex(a => a.id === id);
    if (idx !== -1) {
        alarms.splice(idx, 1);
        renderAlarms();
    }
};

function checkAlarms(now) {
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    const currentSeconds = now.getSeconds();

    if (currentSeconds === 0) { // Check only at the start of the minute
        alarms.forEach(alarm => {
            if (alarm.enabled && alarm.time === currentTime) {
                playAlarm();
                alert(`ALARM: ${alarm.label}`);
            }
        });
    }
}
