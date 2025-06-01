import React, { useState, useEffect } from "react";
import { investmentAPI } from "../services/api";
import { Investment } from "../types";
import Spinner from "../components/ui/Spinner";
import AlertMessage from "../components/ui/AlertMessage";
import { formatCurrency } from "../utils/formatters";

const InvestmentsPage: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        const response = await investmentAPI.getUserInvestments();

        // Ensure response data is an array
        const fetchedInvestments = Array.isArray(response?.data)
          ? response.data
          : [];

        setInvestments(fetchedInvestments);
      } catch (error: any) {
        console.error("Error fetching investments:", error);
        setError(
          error?.response?.data?.message ||
            "Failed to load investments. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  const calculateProfit = (
    current: number,
    purchase: number,
    quantity: number
  ): number => {
    return (current - purchase) * quantity;
  };

  const calculateProfitPercentage = (
    current: number,
    purchase: number
  ): number => {
    if (!purchase) return 0;
    return ((current - purchase) / purchase) * 100;
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Investments</h1>

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {!Array.isArray(investments) || investments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">You don't have any investments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit/Loss
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investments.map((investment) => {
                  const purchasePrice = investment?.purchasePrice || 0;
                  const currentPrice = investment?.currentPrice || 0;
                  const quantity = investment?.quantity || 0;

                  const profit = calculateProfit(
                    currentPrice,
                    purchasePrice,
                    quantity
                  );
                  const profitPercentage = calculateProfitPercentage(
                    currentPrice,
                    purchasePrice
                  );
                  const isProfitable = profit >= 0;

                  return (
                    <tr key={investment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {investment.assetName || "Unknown Asset"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {investment.ticker || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {investment.investmentType
                            ? investment.investmentType.replace("_", " ")
                            : "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(purchasePrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(currentPrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm ${
                            isProfitable ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(profit)} ({isProfitable ? "+" : ""}
                          {profitPercentage.toFixed(2)}%)
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentsPage;
