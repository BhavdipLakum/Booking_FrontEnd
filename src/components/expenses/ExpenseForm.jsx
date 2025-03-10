import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../../context/ThemeContext"; // Adjust the import path as needed

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { theme } = useContext(ThemeContext); // Access theme context
  const isDarkMode = theme === "dark";

  const [formData, setFormData] = useState({
    description: "",
    category: "equipment",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    receipt: null,
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      axios
        .get(`http://localhost:4000/api/expenses/${id}`)
        .then((response) => {
          setFormData(response.data);
          if (response.data.receipt) {
            setReceiptPreview(response.data.receipt);
          }
        })
        .catch((error) => console.error("Error fetching expense:", error));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, receipt: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.expenseDate) newErrors.expenseDate = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    });

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:4000/api/expenses/${id}`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axios.post("http://localhost:4000/api/expenses", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/expenses");
    } catch (err) {
      console.error("Error saving expense:", err);
      setErrors({ submit: "Failed to save expense" });
    }
    setIsSubmitting(false);
  };

  // Add console log to check if ThemeContext is working (similar to BookingForm)
  console.log("Current theme:", theme);

  return (
    <div
      className={`max-w-3xl mx-auto p-6 shadow-lg rounded-lg mt-20 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <h2
        className={`text-2xl font-semibold text-center mb-6 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        {isEditMode ? "Edit Expense" : "Add New Expense"}
      </h2>
      {errors.submit && (
        <div
          className={`mb-4 text-center ${
            isDarkMode ? "text-red-400" : "text-red-500"
          }`}
        >
          {errors.submit}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Description*
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.description
                ? "border-red-500"
                : isDarkMode
                ? "border-gray-600"
                : "border-gray-300"
            } ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
            }`}
          />
          {errors.description && (
            <div
              className={`text-sm ${
                isDarkMode ? "text-red-400" : "text-red-500"
              }`}
            >
              {errors.description}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Category*
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.category
                ? "border-red-500"
                : isDarkMode
                ? "border-gray-600"
                : "border-gray-300"
            } ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
            }`}
          >
            <option value="equipment">Equipment</option>
            <option value="travel">Travel</option>
            <option value="software">Software/Subscriptions</option>
            <option value="marketing">Marketing</option>
            <option value="office">Office Supplies</option>
            <option value="venue">Venue Fees</option>
            <option value="contractors">Contractors/Staff</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>
          {errors.category && (
            <div
              className={`text-sm ${
                isDarkMode ? "text-red-400" : "text-red-500"
              }`}
            >
              {errors.category}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Amount (₹)*
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full p-2 border rounded-md ${
              errors.amount
                ? "border-red-500"
                : isDarkMode
                ? "border-gray-600"
                : "border-gray-300"
            } ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
            }`}
          />
          {errors.amount && (
            <div
              className={`text-sm ${
                isDarkMode ? "text-red-400" : "text-red-500"
              }`}
            >
              {errors.amount}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Date*
          </label>
          <input
            type="date"
            name="expenseDate"
            value={formData.expenseDate}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.expenseDate
                ? "border-red-500"
                : isDarkMode
                ? "border-gray-600"
                : "border-gray-300"
            } ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
            }`}
          />
          {errors.expenseDate && (
            <div
              className={`text-sm ${
                isDarkMode ? "text-red-400" : "text-red-500"
              }`}
            >
              {errors.expenseDate}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          >
            <option value="cash">Cash</option>
            <option value="creditCard">Credit Card</option>
            <option value="bankTransfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
        <div className="form-group">
          <label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Receipt (optional)
          </label>
          <input
            type="file"
            name="receipt"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className={`w-full p-2 border rounded-md ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-white file:bg-gray-600 file:text-white file:border-gray-500"
                : "border-gray-300 bg-white"
            }`}
          />
          {receiptPreview && (
            <div className="mt-2">
              <img
                src={receiptPreview}
                alt="Receipt preview"
                className="h-20 w-20 object-cover rounded"
              />
            </div>
          )}
        </div>
        <div className="form-group">
          <label className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className={`w-full p-2 border rounded-md ${
              isDarkMode
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          ></textarea>
        </div>
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => navigate("/expenses")}
            className={`p-2 rounded-md ${
              isDarkMode
                ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-600 text-white p-2 rounded-md ${
              isDarkMode ? "hover:bg-blue-500" : "hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
              ? "Update Expense"
              : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
