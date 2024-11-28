document.getElementById('ftp').addEventListener('input', (event) => {
    if (event.target.validity.valid){
        calculateZones();
    }
});

let myChart;

function loadFTP() {
    const savedFTP = localStorage.getItem('ftp');
    if (savedFTP) {
        document.getElementById('ftp').value = savedFTP;
        calculateZones(savedFTP);
    }
}

function calculateZones(savedFTP = null) {
    const ftp = savedFTP || parseFloat(document.getElementById('ftp').value);

    // Speichere den FTP-Wert im localStorage
    localStorage.setItem('ftp', ftp);

    const zones = [
        { name: 'Zone 1 (Erholung)', min:0, max: 0.55 * ftp, color: 'lightgray' },
        { name: 'Zone 2 (Ausdauer)', min: 0.55 * ftp, max: 0.75 * ftp, color: 'lightblue' },
        { name: 'Zone 3 (Tempo)', min: 0.75 * ftp, max: 0.90 * ftp, color: 'lime' },
        { name: 'Zone 4 (Laktat-Schwelle)',min:0.90 * ftp, max: ftp, color: 'yellow' },
        { name: 'Zone 5 (VO2max)', min:ftp, max: 1.2*ftp, color: 'orange' },
        { name: 'Zone 6 (Anaerobe Kapazität)', min:1.2*ftp, max: 1.5 * ftp, color: 'red' },
        { name: 'Zone 7 (Neuromuskuläre Leistung)', min: 1.5*ftp, max: 2 * ftp, color: 'purple' }
    ];
 
    // Berechne die Werte für das gestapelte Diagramm
    const zoneNames = zones.map(zone => zone.name);
    const dataValues = zones.map((zone, index) => {
        return zone.max - (index > 0 ? zones[index - 1].max : 0);
    });

    const chartData = {
        labels: [''],
        datasets: zones.map((zone, index) => ({
            label: zone.name +": "+zone.min+"-"+zone.max+"W",
            data: [dataValues[index]],
            backgroundColor: zone.color,
            borderColor: zone.color,
            borderWidth: 1
        }))
    };

    const config = {
        type: 'bar',
        data: chartData,
        options: {
            plugins:{
                legend: {
                    onClick: function(event, legendItem) {}
                },
            },
            indexAxis: 'y', // Setzt die Achse für horizontale Balken
            scales: {
                x: {
                    beginAtZero: true,
                    stacked: true, // Aktiviert das gestapelte Diagramm
                    title: {
                        display: true,
                        text: 'Watt (W)'
                    }
                },
                y: {
                    stacked: true, // Aktiviert das gestapelte Diagramm
                }
            }
        }
    };

    if (myChart) {
        myChart.destroy(); // Zerstöre das alte Diagramm, wenn es existiert
    }

    const ctx = document.getElementById('chart').getContext('2d');
    myChart = new Chart(ctx, config);
}

// Lade den gespeicherten FTP-Wert beim Laden der Seite
window.onload = loadFTP;