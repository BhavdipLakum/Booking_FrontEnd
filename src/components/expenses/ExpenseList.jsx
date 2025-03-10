import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const handleDelete = async (id) => {
    // if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await axios.delete(
        `http://booking-front-end-pearl.vercel.app/api/expenses/${id}`
      );
      // alert('Expense deleted successfully!');
      setExpenses(expenses.filter((expense) => expense._id !== id)); // Update UI
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense");
    }
  };

  const handleViewReceipt = (receiptUrl) => {
    setSelectedReceipt(
      `${"http://booking-front-end-pearl.vercel.app"}${receiptUrl}`
    );
  };
  const handleCloseReceipt = () => {
    setSelectedReceipt(null);
  };

  const [filters, setFilters] = useState({
    category: "all",
    searchQuery: "",
    timeframe: "thisMonth",
    sortBy: "date",
  });
  const [summary, setSummary] = useState({
    totalAmount: 0,
    categoryBreakdown: {},
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.category !== "all") params.category = filters.category;
        if (filters.timeframe) params.timeframe = filters.timeframe;
        if (filters.searchQuery) params.search = filters.searchQuery;
        if (filters.sortBy) params.sortBy = filters.sortBy;

        const res = await axios.get(
          "http://booking-front-end-pearl.vercel.app/api/expenses",
          {
            params,
          }
        );

        if (Array.isArray(res.data)) {
          setExpenses(res.data);
          const total = res.data.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );

          const breakdown = res.data.reduce((acc, expense) => {
            const category = expense.category;
            if (!acc[category]) {
              acc[category] = 0;
            }
            acc[category] += expense.amount;
            return acc;
          }, {});

          setSummary({
            totalAmount: total,
            categoryBreakdown: breakdown,
          });
        } else {
          setError("Invalid response format. Expected an array of expenses.");
        }

        setError(null);
      } catch (err) {
        setError("Failed to fetch expenses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  if (loading)
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Loading expenses...
      </div>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 mt-20">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold mb-2 sm:mb-0 dark:text-white">
          Expenses
        </h2>
        <div className="text-xl font-bold mb-2 sm:mb-0 dark:text-white">
          Total:{" "}
          <span className="text-green-600 dark:text-green-400">
            ₹{summary.totalAmount.toFixed(2)}
          </span>
        </div>
        <Link
          to="/expenses/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full sm:w-auto text-center"
        >
          <i className="icon-plus"></i> Add Expense
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(summary.categoryBreakdown).map(([category, amount]) => (
          <div
            key={category}
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md shadow-md"
          >
            <h4 className="font-semibold dark:text-white">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h4>
            <div className="text-lg text-gray-700 dark:text-gray-300">
              ₹{amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <input
            type="text"
            name="searchQuery"
            value={filters.searchQuery}
            onChange={handleFilterChange}
            placeholder="Search description..."
            className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md w-full sm:w-64 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-3 py-2 gap-1 rounded-md flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              width="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-white"
            >
              <path d="M21 21l-4.35-4.35M17.5 10.5a7.5 7.5 0 1 0-15 0 7.5 7.5 0 0 0 15 0z"></path>
            </svg>
            Search
          </button>
        </form>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-gray-700 dark:text-gray-300"
            >
              Category:
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            >
              <option value="all" className="dark:bg-gray-800 dark:text-white">
                All Categories
              </option>
              <option
                value="equipment"
                className="dark:bg-gray-800 dark:text-white"
              >
                Equipment
              </option>
              <option
                value="travel"
                className="dark:bg-gray-800 dark:text-white"
              >
                Travel
              </option>
              <option
                value="software"
                className="dark:bg-gray-800 dark:text-white"
              >
                Software
              </option>
              <option
                value="marketing"
                className="dark:bg-gray-800 dark:text-white"
              >
                Marketing
              </option>
              <option
                value="office"
                className="dark:bg-gray-800 dark:text-white"
              >
                Office Supplies
              </option>
              <option
                value="venue"
                className="dark:bg-gray-800 dark:text-white"
              >
                Venue Fees
              </option>
              <option
                value="contractors"
                className="dark:bg-gray-800 dark:text-white"
              >
                Contractors
              </option>
              <option
                value="insurance"
                className="dark:bg-gray-800 dark:text-white"
              >
                Insurance
              </option>
              <option
                value="other"
                className="dark:bg-gray-800 dark:text-white"
              >
                Other
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="timeframe"
              className="block text-gray-700 dark:text-gray-300"
            >
              Timeframe:
            </label>
            <select
              id="timeframe"
              name="timeframe"
              value={filters.timeframe}
              onChange={handleFilterChange}
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            >
              <option
                value="thisMonth"
                className="dark:bg-gray-800 dark:text-white"
              >
                This Month
              </option>
              <option
                value="lastMonth"
                className="dark:bg-gray-800 dark:text-white"
              >
                Last Month
              </option>
              <option
                value="thisQuarter"
                className="dark:bg-gray-800 dark:text-white"
              >
                This Quarter
              </option>
              <option
                value="thisYear"
                className="dark:bg-gray-800 dark:text-white"
              >
                This Year
              </option>
              <option
                value="lastYear"
                className="dark:bg-gray-800 dark:text-white"
              >
                Last Year
              </option>
              <option value="all" className="dark:bg-gray-800 dark:text-white">
                All Time
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sortBy"
              className="block text-gray-700 dark:text-gray-300"
            >
              Sort By:
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            >
              <option value="date" className="dark:bg-gray-800 dark:text-white">
                Date (Newest)
              </option>
              <option
                value="dateAsc"
                className="dark:bg-gray-800 dark:text-white"
              >
                Date (Oldest)
              </option>
              <option
                value="amountDesc"
                className="dark:bg-gray-800 dark:text-white"
              >
                Amount (Highest)
              </option>
              <option
                value="amountAsc"
                className="dark:bg-gray-800 dark:text-white"
              >
                Amount (Lowest)
              </option>
            </select>
          </div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No expenses found matching your criteria.
        </div>
      ) : (
        <div className="p-4 mt-20">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">
            Expenses
          </h2>

          {selectedReceipt && (
            <div className="mt-4 p-4 border rounded-md shadow-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold dark:text-white">
                  Receipt Preview
                </h3>
                <button
                  onClick={handleCloseReceipt}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Close
                </button>
              </div>
              <img
                src={selectedReceipt}
                alt="Receipt"
                className="w-full h-auto max-w-md mx-auto border rounded-md dark:border-gray-700"
              />
            </div>
          )}

          <div className="overflow-x-auto mt-2">
            <table className="table-auto w-full dark:bg-gray-900 shadow-md rounded-md">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">
                    Date
                  </th>
                  <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">
                    Description
                  </th>
                  <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">
                    Category
                  </th>
                  <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">
                    Amount
                  </th>
                  <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">
                    Method
                  </th>
                  <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">
                    Receipt
                  </th>
                  <th className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="border-b dark:border-gray-700"
                  >
                    <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">
                      {expense.description}
                    </td>
                    <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">
                      {expense.category.charAt(0).toUpperCase() +
                        expense.category.slice(1)}
                    </td>
                    <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">
                      {expense.paymentMethod}
                    </td>
                    <td className="border-b dark:border-gray-700 px-4 py-2 dark:text-gray-200">
                      {expense.receipt ? (
                        <button
                          onClick={() =>
                            handleViewReceipt(`${expense.receipt}`)
                          }
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Receipt
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="d-flex gap-2 border-b dark:border-gray-700 px-4 py-2">
                      <Link
                        to={`/expenses/${expense._id}/edit`}
                        className="block text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-2" />
                      </Link>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="w-full text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
