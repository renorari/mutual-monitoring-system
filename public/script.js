document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("chart");

    const chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Ping",
                data: []
            }]
        },
        options: {
            animation: false,
            scales: {
                yAxes: [{
                    beginAtZero: true
                }]
            },
            plugins: {
                colors: {
                    forceOverride: true
                }
            }
        }
    });

    function updateChart() {
        fetch("/api/ping/all")
            .then(response => response.json())
            .then(data => {
                fetch("/api/ping/all/partner")
                    .then(response => response.json())
                    .then(partnerData => {
                        const datasetsOneName = data[0].serverName || "Partner Server Ping";
                        const datasetsTwoName = partnerData[0].serverName || "My Server Ping";
                        var datasetsOne = {};
                        var datasetsTwo = {};
                        data.forEach(d => {
                            datasetsOne[d.date] = d;
                        });
                        partnerData.forEach(d => {
                            datasetsTwo[d.date] = d;
                        });
                        const datasetsDates = [...new Set([...Object.keys(datasetsOne).map(d => Number(d)), ...Object.keys(datasetsTwo).map(d => Number(d))])].sort((a, b) => new Date(a) - new Date(b));
                        chart.data.labels = datasetsDates.map(d => new Date(d).toLocaleTimeString());
                        if (chart.data.datasets[0]) {
                            chart.data.datasets[0].label = datasetsOneName;
                            chart.data.datasets[0].data = datasetsDates.map(d => {
                                if (datasetsOne[d] && datasetsOne[d].status == "ok") return datasetsOne[d].data.ping;
                                else return null;
                            });
                            chart.data.datasets[0].spanGaps = true;
                        } else {
                            chart.data.datasets[0] = {
                                label: datasetsOneName,
                                data: datasetsDates.map(d => {
                                    if (datasetsOne[d] && datasetsOne[d].status == "ok") return datasetsOne[d].data.ping;
                                    else return null;
                                }),
                                spanGaps: true
                            };
                        }
                        if (chart.data.datasets[1]) {
                            chart.data.datasets[1].label = datasetsTwoName;
                            chart.data.datasets[1].data = datasetsDates.map(d => {
                                if (datasetsTwo[d] && datasetsTwo[d].status == "ok") return datasetsTwo[d].data.ping;
                                else return null;
                            });
                            chart.data.datasets[1].spanGaps = true;
                        } else {
                            chart.data.datasets[1] = {
                                label: datasetsTwoName,
                                data: datasetsDates.map(d => {
                                    if (datasetsTwo[d] && datasetsTwo[d].status == "ok") return datasetsTwo[d].data.ping;
                                    else return null;
                                }),
                                spanGaps: true
                            };
                        }
                        chart.update();
                    });
            });
    }

    updateChart();
    setInterval(updateChart, 2000);
});