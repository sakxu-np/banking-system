import React, { useState, useEffect } from "react";
import { accountsAPI, transactionsAPI } from "../services/api";
import { Account, TransactionFormData } from "../types";
import Spinner from "../components/ui/Spinner";
import AlertMessage from "../components/ui/AlertMessage";
import { formatCurrency, getCurrencySymbol } from "../utils/formatters";

const TransfersPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    accountId: "",
    transactionType: "transfer",
    amount: 0,
    description: "",
    currency: "NPR",
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await accountsAPI.getAll();

        // Ensure accounts data is an array
        const fetchedAccounts = Array.isArray(response?.data)
          ? response.data
          : [];

        setAccounts(fetchedAccounts);

        if (fetchedAccounts.length > 0 && fetchedAccounts[0]?._id) {
          const firstAccount = fetchedAccounts[0];
          setFormData((prev) => ({
            ...prev,
            accountId: firstAccount._id,
            currency: firstAccount.currency || "NPR",
          }));
        }
      } catch (error: any) {
        console.error("Error fetching accounts:", error);
        setError(
          error?.response?.data?.message ||
            "Failed to load accounts. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for account selection
    if (name === "accountId") {
      handleAccountChange(e as React.ChangeEvent<HTMLSelectElement>);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update the account ID
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Find the selected account to get its currency
    if (name === "accountId") {
      const selectedAccount = accounts.find((account) => account._id === value);
      if (selectedAccount) {
        setFormData((prev) => ({
          ...prev,
          currency: selectedAccount.currency,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.accountId) {
      setError("Please select a source account");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (
      formData.transactionType === "transfer" &&
      !formData.receiverAccountId
    ) {
      setError("Please select a destination account for the transfer");
      return;
    }

    if (
      formData.transactionType === "transfer" &&
      formData.accountId === formData.receiverAccountId
    ) {
      setError("Source and destination accounts cannot be the same");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Clone form data to avoid modifying state directly during submission
      const transactionData = { ...formData };

      // Execute the transaction
      const response = await transactionsAPI.create(transactionData);

      if (!response || !response.data) {
        throw new Error("Failed to process transaction. Please try again.");
      }

      setSuccess(
        `${
          formData.transactionType.charAt(0).toUpperCase() +
          formData.transactionType.slice(1)
        } completed successfully!`
      );

      // Reset form after successful submission
      setFormData({
        ...formData,
        amount: 0,
        description: "",
      });

      // Refresh accounts to show updated balances
      const accountsResponse = await accountsAPI.getAll();
      const refreshedAccounts = Array.isArray(accountsResponse?.data)
        ? accountsResponse.data
        : [];
      setAccounts(refreshedAccounts);
    } catch (error: any) {
      console.error("Transaction error:", error);
      setError(
        error?.response?.data?.message ||
          "Failed to process transaction. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!Array.isArray(accounts) || accounts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Transfer Money
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <AlertMessage
            type="info"
            message="You need at least one account to make transfers."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transfer Money</h1>

      {error && (
        <div className="mb-4">
          <AlertMessage
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      {success && (
        <div className="mb-4">
          <AlertMessage
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="transactionType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Transaction Type
            </label>
            <select
              id="transactionType"
              name="transactionType"
              value={formData.transactionType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="accountId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {formData.transactionType === "transfer"
                ? "Source Account"
                : "Account"}
            </label>
            <select
              id="accountId"
              name="accountId"
              value={formData.accountId}
              onChange={handleAccountChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              {accounts.map((account) => (
                <option
                  key={account._id || "unknown"}
                  value={account._id || ""}
                >
                  {(account.accountType?.charAt(0).toUpperCase() || "") +
                    (account.accountType?.slice(1) || "")}{" "}
                  - {account.accountNumber || "Unknown"} (
                  {formatCurrency(
                    account.balance || 0,
                    account.currency || "NPR"
                  )}
                  )
                </option>
              ))}
            </select>
          </div>

          {formData.transactionType === "transfer" && (
            <div>
              <label
                htmlFor="receiverAccountId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Destination Account
              </label>
              <select
                id="receiverAccountId"
                name="receiverAccountId"
                value={formData.receiverAccountId || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option value="" disabled>
                  Select destination account
                </option>
                {accounts
                  .filter((acc) => acc._id !== formData.accountId)
                  .map((account) => (
                    <option
                      key={account._id || "unknown"}
                      value={account._id || ""}
                    >
                      {(account.accountType?.charAt(0).toUpperCase() || "") +
                        (account.accountType?.slice(1) || "")}{" "}
                      - {account.accountNumber || "Unknown"} (
                      {formatCurrency(
                        account.balance || 0,
                        account.currency || "NPR"
                      )}
                      )
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {getCurrencySymbol(formData.currency || "NPR")}
                </span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="mt-1 block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {formData.currency || "NPR"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows={3}
              placeholder="Enter a description for this transaction"
              required
            ></textarea>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <Spinner size="sm" color="text-white" />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                `Complete ${
                  formData.transactionType.charAt(0).toUpperCase() +
                  formData.transactionType.slice(1)
                }`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransfersPage;
