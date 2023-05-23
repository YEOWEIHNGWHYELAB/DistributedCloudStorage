import React from "react";
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js'
Chart.register(ArcElement);

const PieChartStat = ({ data }) => {
    const chartData = {
        datasets: [
            {
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                hoverBackgroundColor: ['#000', '#000', '#000', '#000'],
            },
        ],
    };

    return (
        <div id="chart-container" style={{ width: '35%', height: '35%' }}>
            <Pie 
                data={chartData} 
            />
        </div>
    );
};

export default PieChartStat;
