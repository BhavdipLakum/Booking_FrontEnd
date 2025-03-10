import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Spinner from "../layout/Spinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FinancialSummary = () => {
  const [summaryData, setSummaryData] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    bookings: 0,
  });

  const [monthlyData, setMonthlyData] = useState({
    monthlyRevenue: [],
    monthlyExpenses: [],
    monthlyProfit: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const headers = { Authorization: `Bearer ${token}` };

        const revenueRes = await axios.get(
          "http://localhost:4000/api/payments",
          { headers }
        );
        const expensesRes = await axios.get(
          "http://localhost:4000/api/expenses",
          { headers }
        );
        const bookingsRes = await axios.get(
          "http://localhost:4000/api/bookings",
          { headers }
        );

        console.log("Revenue API Response:", revenueRes.data);
        console.log("Expenses API Response:", expensesRes.data);
        console.log("Bookings API Response:", bookingsRes.data);

        const totalRevenue = revenueRes.data.reduce(
          (sum, item) => sum + (item.amount || 0),
          0
        );
        const totalExpenses = expensesRes.data.reduce(
          (sum, item) => sum + (item.amount || 0),
          0
        );
        const totalBookings = bookingsRes.data.length;

        setSummaryData({
          revenue: totalRevenue,
          expenses: totalExpenses,
          profit: totalRevenue - totalExpenses,
          bookings: totalBookings,
        });

        const monthlyRevenue = new Array(12).fill(0);
        const monthlyExpenses = new Array(12).fill(0);
        const monthlyProfit = new Array(12).fill(0);

        revenueRes.data.forEach(({ amount, date }) => {
          const month = new Date(date).getMonth();
          monthlyRevenue[month] += amount;
        });

        expensesRes.data.forEach(({ amount, date }) => {
          const month = new Date(date).getMonth();
          monthlyExpenses[month] += amount;
        });

        for (let i = 0; i < 12; i++) {
          monthlyProfit[i] = monthlyRevenue[i] - monthlyExpenses[i];
        }

        setMonthlyData({ monthlyRevenue, monthlyExpenses, monthlyProfit });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch financial data");
        setLoading(false);
        console.error("Error fetching financial data:", err);
      }
    };

    fetchSummaryData();
  }, []);

  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Revenue",
        data: monthlyData.monthlyRevenue,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Expenses",
        data: monthlyData.monthlyExpenses,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Profit",
        data: monthlyData.monthlyProfit,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Financial Report",
      },
    },
  };

  if (loading)
    return (
      <div className="text-center text-xl font-semibold text-gray-600">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="text-center text-xl font-semibold text-red-600">
        {error}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-8 mt-14">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Financial Summary
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            ₹{summaryData.revenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">
            Total Expenses
          </h3>
          <p className="text-2xl font-bold text-red-600">
            ₹{summaryData.expenses.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Net Profit</h3>
          <p className="text-2xl font-bold text-blue-600">
            ₹{summaryData.profit.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">
            Total Bookings
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {summaryData.bookings.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="monthly-report max-w-4xl mx-auto p-4 mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Monthly Report
        </h2>
        <div className="chart-container bg-white p-6 shadow-lg rounded-lg">
          <Bar options={chartOptions} data={chartData} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:space-y-0">
        <button
          onClick={() => window.print()}
          className="px-3 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full md:w-auto"
        >
          Print Report
        </button>
      </div>
    </div>
  );
};

export default FinancialSummary;
