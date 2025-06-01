import React, { useState, useEffect } from "react";
import { budgetAPI } from "../services/api";
import { Budget, BudgetCategory } from "../types";
import Spinner from "../components/ui/Spinner";
import AlertMessage from "../components/ui/AlertMessage";
import { formatCurrency, formatDate } from "../utils/formatters";

const BudgetPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const response = await budgetAPI.getUserBudgets();

        // Ensure response data is an array
        const fetchedBudgets = Array.isArray(response?.data)
          ? response.data
          : [];

        setBudgets(fetchedBudgets);
      } catch (error: any) {
        console.error("Error fetching budgets:", error);
        setError(
          error?.response?.data?.message ||
            "Failed to load budget data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  // Calculate total spent across all categories
  const calculateTotalSpent = (
    categories: BudgetCategory[] | undefined
  ): number => {
    if (!Array.isArray(categories)) return 0;
    return categories.reduce(
      (total, category) => total + (category?.spent || 0),
      0
    );
  };

  // Calculate spending percentage
  const calculateSpendingPercentage = (
    spent: number,
    limit: number
  ): number => {
    if (limit <= 0) return 0;
    return (spent / limit) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Budget</h1>
        {Array.isArray(budgets) && budgets.length > 0 && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => alert("Budget creation feature coming soon!")}
          >
            Create New Budget
          </button>
        )}
      </div>

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {!Array.isArray(budgets) || budgets.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No budget data available yet.</p>
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => alert("Budget creation feature coming soon!")}
            >
              Create Your First Budget
            </button>
          </div>
        ) : (
          <>
            {budgets.map((budget) => {
              const totalSpent = calculateTotalSpent(budget.categories);
              const totalBudget = budget?.totalBudget || 0;
              const spendingPercentage = calculateSpendingPercentage(
                totalSpent,
                totalBudget
              );
              const isOverBudget = totalSpent > totalBudget;

              return (
                <div key={budget._id} className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {budget.name || "Unnamed Budget"}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {budget.startDate && budget.endDate
                        ? `${formatDate(budget.startDate)} - ${formatDate(
                            budget.endDate
                          )}`
                        : "No date range specified"}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700">Overall Budget</span>
                      <span
                        className={
                          isOverBudget
                            ? "text-red-600 font-semibold"
                            : "text-gray-700"
                        }
                      >
                        {formatCurrency(totalSpent)} /{" "}
                        {formatCurrency(totalBudget)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          isOverBudget ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(spendingPercentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mb-3">Categories</h3>
                  {Array.isArray(budget.categories) &&
                  budget.categories.length > 0 ? (
                    <div className="space-y-4">
                      {budget.categories.map((category, index) => {
                        const categorySpent = category?.spent || 0;
                        const categoryLimit = category?.limit || 0;
                        const categoryPercentage = calculateSpendingPercentage(
                          categorySpent,
                          categoryLimit
                        );
                        const isCategoryOverBudget =
                          categorySpent > categoryLimit;

                        return (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">
                                {category.name || "Unnamed Category"}
                              </span>
                              <span
                                className={
                                  isCategoryOverBudget
                                    ? "text-red-600"
                                    : "text-gray-700"
                                }
                              >
                                {formatCurrency(categorySpent)} /{" "}
                                {formatCurrency(categoryLimit)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full`}
                                style={{
                                  width: `${Math.min(
                                    categoryPercentage,
                                    100
                                  )}%`,
                                  backgroundColor: isCategoryOverBudget
                                    ? "#EF4444"
                                    : category.color || "#10B981",
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No categories defined for this budget.
                    </p>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetPage;
