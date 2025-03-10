import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Static data for testing
  const chartData = {
    labels: ["January", "February", "March"],
    datasets: [
      {
        label: 'Revenue',
        data: [10000, 12000, 13000],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Expenses',
        data: [4000, 6000, 7000],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Profit',
        data: [4000, 6000, 6000],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Financial Report',
      },
    },
  };

  // Simulate loading for 2 seconds
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) return <div className="text-center text-xl">Loading...</div>;
  if (error) return <div className="text-center text-xl text-red-500">Error: {error}</div>;

  return (
    <div className="monthly-report max-w-4xl mx-auto p-4 mt-16">
      <h2 className="text-2xl font-semibold mb-6 text-center">Monthly Report</h2>
      <div className="chart-container bg-white p-6 shadow-lg rounded-lg">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
};

export default MonthlyReport;
