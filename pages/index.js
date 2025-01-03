import React, { useState } from "react";
import Head from "next/head";
import Chart from "chart.js/auto"; 


export default function Home() {
    const [errorMessage, setErrorMessage] = useState("");
    const [chartInstance, setChartInstance] = useState(null);

    async function fetchHistoricalData(ticker) {
        const url = `https://api.coingecko.com/api/v3/coins/${ticker}/market_chart?vs_currency=usd&days=120`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Unable to fetch historical data.");
            const data = await response.json();
            return data.prices.map((price) => price[1]);
        } catch (error) {
            console.error(error);
            throw new Error("Unable to fetch the historical data. Please check the crypto ticker.");
        }
    }

    function calculateDailyReturns(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }
        return returns;
    }

    function monteCarloSimulation(startPrice, dailyReturns, numDays = 30, numSimulations = 300) {
        const simulations = [];
        const avgPrices = Array(numDays).fill(0);

        for (let i = 0; i < numSimulations; i++) {
            const simulation = [startPrice];
            for (let j = 1; j <= numDays; j++) {
                const randomReturn = dailyReturns[Math.floor(Math.random() * dailyReturns.length)];
                const nextPrice = simulation[j - 1] * (1 + randomReturn);
                simulation.push(nextPrice);
                avgPrices[j - 1] += nextPrice / numSimulations;
            }
            simulations.push(simulation);
        }

        return { simulations, avgPrices };
    }

    async function runSimulation() {
        const ticker = document.getElementById("cryptoTicker").value.toLowerCase();
        setErrorMessage("");

        try {
            const historicalPrices = await fetchHistoricalData(ticker);
            const startPrice = historicalPrices[historicalPrices.length - 1];
            const dailyReturns = calculateDailyReturns(historicalPrices);
            const { simulations, avgPrices } = monteCarloSimulation(startPrice, dailyReturns);

            const ctx = document.getElementById("simulationChart").getContext("2d");
            const datasets = simulations.map((simulation) => ({
                data: simulation,
                borderColor: "rgba(75, 192, 192, 0.1)",
                borderWidth: 1,
                fill: false,
                pointRadius: 0,
            }));
            datasets.push({
                label: "Average Price",
                data: avgPrices,
                borderColor: "red",
                borderWidth: 2,
                fill: false,
            });

            if (chartInstance) {
                chartInstance.destroy();
            }

            const newChartInstance = new Chart(ctx, {
                type: "line",
                data: {
                    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
                    datasets: datasets,
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                    },
                    scales: {
                        x: { title: { display: true, text: "Days" } },
                        y: { title: { display: true, text: "Price (USD)" } },
                    },
                },
            });

            setChartInstance(newChartInstance);
        } catch (error) {
            setErrorMessage(error.message);
        }
    }

    function resetSimulation() {
        setErrorMessage("");
        document.getElementById("cryptoTicker").value = "";

        if (chartInstance) {
            chartInstance.destroy();
            setChartInstance(null);
        }
    }

    return (
        <>
            <Head>
                <meta name="fc:frame" content='{
                    "version": "vNext",
                    "imageUrl": "/images/thumbnail.png",
                    "splashImageUrl": "/images/splash.png",
                    "splashBackgroundColor": "#6a0dad",
                    "button": {
                        "title": "Run Monte Carlo Simulation",
                        "action": {
                            "type": "launch_frame",
                            "url": "https://your-vercel-url.vercel.app/",
                            "name": "Monte Carlo Simulation"
                        }
                    }
                }' />
                <title>Monte Carlo Simulation</title>
            </Head>
            <div style={{ textAlign: "center", padding: "20px" }}>
                <h1>Monte Carlo Simulation</h1>
                <input
                    type="text"
                    placeholder="Enter Crypto Ticker (e.g., BTC)"
                    id="cryptoTicker"
                    style={{ padding: "10px", fontSize: "16px" }}
                />
                <button
                    onClick={runSimulation}
                    style={{
                        padding: "10px 20px",
                        marginLeft: "10px",
                        backgroundColor: "#8a2be2",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Run Simulation
                </button>
                <button
                    onClick={resetSimulation}
                    style={{
                        padding: "10px 20px",
                        marginLeft: "10px",
                        backgroundColor: "#8a2be2",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Reset
                </button>
                <p style={{ color: "red" }}>{errorMessage}</p>
                <div
                    style={{
                        backgroundColor: "white",
                        marginTop: "20px",
                        padding: "20px",
                        borderRadius: "10px",
                    }}
                >
                    <canvas id="simulationChart" width="800" height="400"></canvas>
                </div>
            </div>
        </>
    );
}
