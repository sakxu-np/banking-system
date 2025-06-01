import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
  ChartData,
  ChartType,
  Chart,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  accountsAPI,
  transactionsAPI,
  dashboardAPI,
} from "../services/api";
import Spinner from "../components/ui/Spinner";
import AlertMessage from "../components/ui/AlertMessage";
import { Account } from "../types";
import type { Transaction } from "../types";
import { formatCurrency, formatDate } from "../utils/formatters";

// Extend Transaction type locally
interface DashboardTransaction extends Omit<Transaction, 'transactionType'> {
  date: string;
  transactionType: Transaction['transactionType'];  // Use the same type as in Transaction
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Chart Types
interface DatasetConfig {
  type: ChartType;
  label: string;
  data: number[];
}

interface LineDataset extends DatasetConfig {
  type: 'line';
  fill: boolean;
  borderColor: string;
  tension: number;
}

interface BarDataset extends DatasetConfig {
  type: 'bar';
  backgroundColor: string;
}

interface DoughnutDataset extends DatasetConfig {
  type: 'doughnut';
  backgroundColor: string[];
  borderWidth: number;
}

interface ChartDataConfig<T extends DatasetConfig> {
  labels: string[];
  datasets: T[];
}

type LineChartData = ChartDataConfig<LineDataset>;
type BarChartData = ChartDataConfig<BarDataset>;
type DoughnutChartData = ChartDataConfig<DoughnutDataset>;

// Chart Options
const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(tickValue: number | string) {
          const num = Number(tickValue);
          if (num >= 100000) {
            return `रू ${(num / 1000).toFixed(0)}k`;
          }
          return `रू ${num.toLocaleString('ne-NP')}`;
        }
      }
    }
  },
  plugins: {
    legend: {
      position: 'top' as const
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.dataset.label || '';
          const value = context.raw as number;
          return `${label}: ${formatCurrency(value)}`;
        }
      }
    }
  }
};

const lineChartOptions: ChartOptions<'line'> = {
  ...baseChartOptions
};

const barChartOptions: ChartOptions<'bar'> = {
  ...baseChartOptions
};

const doughnutChartOptions: ChartOptions<'doughnut'> = {
  ...baseChartOptions,
  plugins: {
    ...baseChartOptions.plugins,
    legend: {
      position: 'right' as const
    }
  }
};

// Chart Components
const LineChart: React.FC<{ data: LineChartData }> = ({ data }) => (
  <Line data={data} options={lineChartOptions} />
);

const BarChart: React.FC<{ data: BarChartData }> = ({ data }) => (
  <Bar data={data} options={barChartOptions} />
);

const DoughnutChart: React.FC<{ data: DoughnutChartData }> = ({ data }) => (
  <Doughnut data={data} options={doughnutChartOptions} />
);

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<DashboardTransaction[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<LineChartData>({
    labels: [],
    datasets: [],
  });
  const [transactionHistory, setTransactionHistory] = useState<BarChartData>({
    labels: [],
    datasets: [],
  });
  const [spendingByCategory, setSpendingByCategory] = useState<DoughnutChartData>({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch accounts
        const accountsResponse = await accountsAPI.getAll();
        // Ensure fetchedAccounts is always an array
        const fetchedAccounts = Array.isArray(accountsResponse.data)
          ? accountsResponse.data
          : [];
        setAccounts(fetchedAccounts);

        // If we have accounts, fetch recent transactions for the first account
        if (fetchedAccounts.length > 0) {
          try {
            const transactionsResponse = await transactionsAPI.getByAccountId(
              fetchedAccounts[0]._id,
              { limit: 5 }
            );
            // Ensure transactions is always an array
            const transactions = Array.isArray(
              transactionsResponse.data.transactions
            )
              ? transactionsResponse.data.transactions
              : Array.isArray(transactionsResponse.data)
              ? transactionsResponse.data
              : [];
            setRecentTransactions(transactions);
          } catch (txError) {
            console.error("Error fetching transactions:", txError);
            setRecentTransactions([]);
          }
        }

        // Fetch dashboard chart data
        try {
          const dashboardResponse = await dashboardAPI.getDashboardData();
          
          if (dashboardResponse.data) {
            // Balance History
            if (dashboardResponse.data.balanceHistory) {
              const balanceHistoryData: LineChartData = {
                labels: dashboardResponse.data.balanceHistory.labels,
                datasets: [{
                  type: 'line',
                  label: "Balance History (रू)",
                  data: dashboardResponse.data.balanceHistory.data,
                  fill: false,
                  borderColor: "#0ea5e9",
                  tension: 0.1
                }]
              };
              setBalanceHistory(balanceHistoryData);
            }
            
            // Income vs Expenses
            if (dashboardResponse.data.incomeVsExpenses) {
              const transactionHistoryData: BarChartData = {
                labels: dashboardResponse.data.incomeVsExpenses.labels,
                datasets: [
                  {
                    type: 'bar',
                    label: "Income (रू)",
                    data: dashboardResponse.data.incomeVsExpenses.datasets[0].data,
                    backgroundColor: "#4CAF50"
                  },
                  {
                    type: 'bar',
                    label: "Expenses (रू)",
                    data: dashboardResponse.data.incomeVsExpenses.datasets[1].data,
                    backgroundColor: "#F44336"
                  }
                ]
              };
              setTransactionHistory(transactionHistoryData);
            }
            
            // Spending by Category
            if (dashboardResponse.data.spendingByCategory) {
              const spendingByCategoryData: DoughnutChartData = {
                labels: dashboardResponse.data.spendingByCategory.labels,
                datasets: [{
                  type: 'doughnut',
                  label: "Spending (रू)",
                  data: dashboardResponse.data.spendingByCategory.data,
                  backgroundColor: [
                    "#4CAF50", "#2196F3", "#FF9800", 
                    "#9C27B0", "#F44336", "#00BCD4"
                  ],
                  borderWidth: 1
                }]
              };
              setSpendingByCategory(spendingByCategoryData);
            }
          }
        } catch (chartError) {
          console.error("Error fetching dashboard chart data:", chartError);
          // Continue showing the dashboard even if charts fail to load
        }

        setError(null);
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  const totalBalance = Array.isArray(accounts)
    ? accounts.reduce((sum, account) => sum + (account?.balance || 0), 0)
    : 0;

  // Explicitly set the default currency to NPR for the dashboard
  // Chart data is now fetched from the API in useEffect

  return (
    <div>
      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Account summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Balance
          </h3>
          <div className="text-3xl font-bold text-gray-800">
            {formatCurrency(totalBalance)}
          </div>
          <div className="mt-4">
            <Link
              to="/accounts"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View all accounts →
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            AI Fraud Protection
          </h3>
          <div className="text-xl font-semibold text-gray-800">
            All transactions are protected
          </div>
          <div className="mt-4 flex items-center">
            <svg
              className="text-green-500 h-5 w-5 mr-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-500 text-sm">Active protection</span>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Quick Actions
          </h3>
          <div className="mt-3 flex flex-col space-y-2">
            <Link to="/transfers" className="btn btn-primary py-2 text-center">
              New Transfer
            </Link>
            <Link
              to="/loans/apply"
              className="btn btn-outline py-2 text-center"
            >
              Apply for Loan
            </Link>
          </div>
        </div>
      </div>

      {/* Account list */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Your Accounts</h2>
          <Link
            to="/accounts"
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {!Array.isArray(accounts) || accounts.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No accounts found. Create your first account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(accounts) &&
                  accounts.map((account) => (
                    <tr key={account._id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {account.accountType.charAt(0).toUpperCase() +
                            account.accountType.slice(1)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {account.accountNumber}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(account.balance, account.currency)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            account.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {account.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/accounts/${account._id}`}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          to={`/transfers?accountId=${account._id}`}
                          className="text-secondary-600 hover:text-secondary-900"
                        >
                          Transfer
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charts & Data Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Balance History
          </h2>
          <div className="h-64">
            <LineChart data={balanceHistory} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Income vs Expenses
          </h2>
          <div className="h-64">
            <BarChart data={transactionHistory} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Spending by Category
          </h2>
          <div className="h-64 flex items-center justify-center">
            <div style={{ width: "80%", height: "80%" }}>
              <DoughnutChart data={spendingByCategory} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Recent Transactions
            </h2>
            <Link
              to="/accounts"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {!Array.isArray(recentTransactions) ||
          recentTransactions.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No recent transactions found.
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(recentTransactions) &&
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full ${
                          ["deposit", "loan_disbursement"].includes(
                            transaction.transactionType
                          )
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {["deposit", "loan_disbursement"].includes(
                          transaction.transactionType
                        ) ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 9.293a1 1 0 011.414 0L10 13.586l4.293-4.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
