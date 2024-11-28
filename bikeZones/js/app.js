document.getElementById('ftp').addEventListener('input', (event) => {
    if (event.target.validity.valid){
        calculateZones();
    }
});

let zoneChart;
let powerChart;

const zones = [
    { name: 'Zone 1 (Erholung)', min: 0, max: 0.55, color: 'lightgray' },
    { name: 'Zone 2 (Ausdauer)', min: 0.56, max: 0.75, color: 'lightblue' },
    { name: 'Zone 3 (Tempo)', min: 0.76, max: 0.90, color: 'lime' },
    { name: 'Zone 4 (Laktat-Schwelle)', min: 0.91, max: 1.0, color: 'yellow' },
    { name: 'Zone 5 (VO2max)', min: 1.0, max: 1.2, color: 'orange' },
    { name: 'Zone 6 (Anaerobe Kapazität)', min: 1.21, max: 1.5, color: 'red' },
    { name: 'Zone 7 (Neuromuskuläre Leistung)', min: 1.51, max: 2.0, color: 'purple' }
];

function loadFTP() {
    const savedFTP = localStorage.getItem('ftp');
    if (savedFTP) {
        document.getElementById('ftp').value = savedFTP;
        calculateZones(savedFTP);
    }
}

function calculateZones(savedFTP = null) {
    const ftp = savedFTP || parseFloat(document.getElementById('ftp').value);
    
    if (!isValidFTP(ftp)) {
        alert("Bitte geben Sie einen gültigen FTP-Wert ein.");
        return;
    }

    localStorage.setItem('ftp', ftp);
    const zoneData = getZoneData(ftp);
    plotZoneChart(zoneData);
}

function isValidFTP(ftp) {
    return !isNaN(ftp) && ftp > 0;
}

function getZoneData(ftp) {
    return zones.map(zone => ({
        ...zone,
        min: zone.min * ftp,
        max: zone.max * ftp
    }));
}

function plotZoneChart(zoneData) {
    const chartData = {
        labels: zoneData.map(zone => `${zone.name} (${zone.min.toFixed(0)} - ${zone.max.toFixed(0)} W)`),
        datasets: zoneData.map(zone => ({
            label: zone.name,
            data: [zone.max - (zoneData[zoneData.indexOf(zone) - 1]?.max || 0)],
            backgroundColor: zone.color,
            borderColor: zone.color,
            borderWidth: 1
        }))
    };

    const config = {
        type: 'bar',
        data: chartData,
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    stacked: true,
                    title: { display: true, text: 'Watt (W)' }
                },
                y: {
                    stacked: true,
                    title: { display: true, text: 'Zonen' }
                }
            }
        }
    };

    updateChart(config, 'zoneChart');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fitParser = new FitFileParser();
            const arrayBuffer = e.target.result;
            fitParser.parse(arrayBuffer);
            const powerData = fitParser.records.filter(record => record.power).map(record => record.power);
            const ftp = parseFloat(document.getElementById('ftp').value);

            if (powerData.length > 0 && isValidFTP(ftp)) {
                plotPowerData(powerData, ftp);
            } else {
                alert("Keine Leistungsdaten gefunden oder FTP-Wert ungültig.");
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

function plotPowerData(powerData, ftp) {
    const zoneData = powerData.map(power => {
        const zone = zones.find(z => power >= z.min * ftp && power <= z.max * ftp);
        return zone ? zone.color : 'grey'; // Grey for out of range
    });

    const chartData = {
        labels: powerData.map((_, index) => index + 1),
        datasets: [{
            label: 'Leistungsdaten',
            data: powerData,
            backgroundColor: zoneData,
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                x: {
                    title: { display: true, text: 'Datenpunkte' }
                },
                y: {
                    title: { display: true, text: 'Watt (W)' }
                }
            }
        }
    };

    updateChart(config, 'powerChart');
}

function updateChart(config, chartId) {
    const ctx = document.getElementById(chartId).getContext('2d');
    if (chartId === 'zoneChart') {
        if (zoneChart) {
            zoneChart.destroy();
        }
        zoneChart = new Chart(ctx, config);
    } else if (chartId === 'powerChart') {
        if (powerChart) {
            powerChart.destroy();
        }
        powerChart = new Chart(ctx, config);
    }
}

// Lade den gespeicherten FTP-Wert beim Laden der Seite
window.onload = loadFTP;