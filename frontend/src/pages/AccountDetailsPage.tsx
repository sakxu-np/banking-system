import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { accountsAPI, transactionsAPI } from "../services/api";
import { Account, Transaction } from "../types";
import Spinner from "../components/ui/Spinner";
import AlertMessage from "../components/ui/AlertMessage";
import { formatCurrency, formatDate } from "../utils/formatters";

const AccountDetailsPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!accountId) return;

      try {
        setLoading(true);
        const accountResponse = await accountsAPI.getById(accountId);
        setAccount(accountResponse.data);

        const transactionsResponse = await transactionsAPI.getByAccountId(
          accountId
        );
        // Ensure we always have an array of transactions
        const fetchedTransactions = Array.isArray(
          transactionsResponse.data.transactions
        )
          ? transactionsResponse.data.transactions
          : Array.isArray(transactionsResponse.data)
          ? transactionsResponse.data
          : [];
        setTransactions(fetchedTransactions);
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load account details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, [accountId]);

  if (loading) return <Spinner />;
  if (!account) return <div>Account not found</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/accounts" className="text-blue-600 hover:underline">
          &larr; Back to Accounts
        </Link>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full mb-2">
              {account.accountType.toUpperCase()}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Account #{account.accountNumber}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm">Current Balance</p>
            <p className="text-3xl font-bold text-gray-800">
              {formatCurrency(account.balance, account.currency || "NPR")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
        <Link
          to={`/transfers?accountId=${account._id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          New Transfer
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            No transactions found for this account.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.transactionType === "deposit"
                          ? "bg-green-100 text-green-800"
                          : transaction.transactionType === "withdrawal"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {transaction.transactionType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <span
                      className={
                        transaction.transactionType === "deposit"
                          ? "text-green-600"
                          : transaction.transactionType === "withdrawal"
                          ? "text-red-600"
                          : ""
                      }
                    >
                      {transaction.transactionType === "deposit"
                        ? "+"
                        : transaction.transactionType === "withdrawal"
                        ? "-"
                        : ""}
                      {formatCurrency(
                        transaction.amount,
                        transaction.currency || "NPR"
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountDetailsPage;
