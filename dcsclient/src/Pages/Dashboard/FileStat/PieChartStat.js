import React, { useEffect, useState } from "react";
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js'
Chart.register(ArcElement);

const PieChartStat = ({ data }) => {
    const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleResize = () => {
            const containerWidth = document.getElementById('chart-container').clientWidth;
            const containerHeight = containerWidth; // Adjust height as needed

            setChartDimensions({ width: containerWidth, height: containerHeight });
        };

        handleResize(); // Initial resize

        window.addEventListener('resize', handleResize); // Event listener for window resize

        return () => {
            window.removeEventListener('resize', handleResize); // Cleanup on component unmount
        };
    }, []);

    const chartData = {
        labels: ['YouTube Videos', 'Deleted YouTube Videos', 'GitHub Files', 'Deleted GitHub Files'],
        datasets: [
            {
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                fontSize: 12,
            },
        }
    };

    return (
        <div id="chart-container" style={{ width: '100%', height: '100%' }}>
            <Pie 
                data={chartData} 
                options={chartOptions} 
                width={chartDimensions.width} 
                height={chartDimensions.height}
            />
        </div>
    );
};

export default PieChartStat;
