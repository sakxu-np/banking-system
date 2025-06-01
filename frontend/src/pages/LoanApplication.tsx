import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { accountsAPI, loanAPI } from "../services/api";
import {
  Account,
  LoanApplication as LoanApplicationType,
  LoanApprovalResult,
} from "../types";
import Spinner from "../components/ui/Spinner";
import AlertMessage from "../components/ui/AlertMessage";
import { formatCurrency } from "../utils/formatters";

const LoanApplication: React.FC = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approvalResult, setApprovalResult] =
    useState<LoanApprovalResult | null>(null);

  const [formData, setFormData] = useState<LoanApplicationType>({
    accountId: "",
    loanType: "personal",
    amount: 5000,
    term: 12,
    purpose: "",
    creditScore: 700,
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
          setFormData((prev) => ({
            ...prev,
            accountId: fetchedAccounts[0]._id,
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

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "amount" || name === "term" || name === "creditScore"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setApprovalResult(null);

    try {
      console.log("Submitting loan application with data:", formData);
      const response = await loanAPI.applyForLoan(formData);

      console.log("Loan application response:", response);

      // Defensive check for proper response structure
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      const { approvalResult, loan } = response.data;
      console.log("Received loan data:", loan);

      if (!approvalResult) {
        throw new Error("No approval result returned from server");
      }

      setApprovalResult(approvalResult);

      if (approvalResult.approved) {
        setSuccess(
          "Your loan application has been approved! Redirecting you to your loans..."
        );
        // Add a short delay before navigating to let the user see the success message
        setTimeout(() => {
          navigate("/loans"); // Navigate to the loans page to show the newly applied loan
        }, 2000);
      } else {
        setError("Your loan application was not approved at this time.");
      }
    } catch (error: any) {
      console.error("Loan application error:", error);
      setError(
        error?.response?.data?.message ||
          "Failed to submit loan application. Please try again."
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
      <div className="card p-6">
        <AlertMessage
          type="info"
          message="You need to have at least one account to apply for a loan."
        />
        <div className="mt-4">
          <button
            onClick={() => navigate("/accounts")}
            className="btn btn-primary"
          >
            Create an Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Loan Application</h1>

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <AlertMessage
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      <div className="card p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="accountId" className="form-label">
              Select Account
            </label>
            <select
              id="accountId"
              name="accountId"
              value={formData.accountId}
              onChange={handleChange}
              className="input-field"
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
                  {formatCurrency(account.balance || 0)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="loanType" className="form-label">
              Loan Type
            </label>
            <select
              id="loanType"
              name="loanType"
              value={formData.loanType}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="personal">Personal Loan</option>
              <option value="home">Home Loan</option>
              <option value="auto">Auto Loan</option>
              <option value="education">Education Loan</option>
              <option value="business">Business Loan</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="form-label">
              Loan Amount: {formatCurrency(formData.amount)}
            </label>
            <input
              type="range"
              id="amount"
              name="amount"
              min="1000"
              max="100000"
              step="1000"
              value={formData.amount}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$1,000</span>
              <span>$100,000</span>
            </div>
          </div>

          <div>
            <label htmlFor="term" className="form-label">
              Loan Term: {formData.term} months
            </label>
            <input
              type="range"
              id="term"
              name="term"
              min="6"
              max="60"
              step="6"
              value={formData.term}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>6 months</span>
              <span>60 months</span>
            </div>
          </div>

          <div>
            <label htmlFor="purpose" className="form-label">
              Purpose of Loan
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="input-field"
              rows={3}
              placeholder="Please describe the purpose of this loan"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="creditScore" className="form-label">
              Credit Score: {formData.creditScore}
            </label>
            <input
              type="range"
              id="creditScore"
              name="creditScore"
              min="300"
              max="850"
              value={formData.creditScore}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>300 (Poor)</span>
              <span>850 (Excellent)</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="btn btn-primary w-full py-3"
              disabled={submitting}
            >
              {submitting ? "Processing Application..." : "Apply for Loan"}
            </button>
          </div>
        </form>
      </div>

      {approvalResult && (
        <div
          className={`card p-6 border-l-4 ${
            approvalResult.approved ? "border-green-500" : "border-red-500"
          }`}
        >
          <h2 className="text-xl font-bold mb-4">Loan Decision</h2>

          <div className="mb-4">
            <div className="flex items-center">
              <div
                className={`text-lg font-semibold ${
                  approvalResult.approved ? "text-green-600" : "text-red-600"
                }`}
              >
                {approvalResult.approved ? "Approved" : "Not Approved"}
              </div>
              <div className="ml-auto">
                Score: {Math.round((approvalResult.score || 0) * 100)}/100
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className={`h-2.5 rounded-full ${
                  approvalResult.approved ? "bg-green-500" : "bg-red-500"
                }`}
                style={{
                  width: `${Math.round((approvalResult.score || 0) * 100)}%`,
                }}
              ></div>
            </div>
          </div>

          {approvalResult.approved && (
            <div className="mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Suggested Interest Rate:</span>
                <span className="font-semibold">
                  {approvalResult.suggestedInterestRate || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maximum Approved Amount:</span>
                <span className="font-semibold">
                  {formatCurrency(approvalResult.maxApprovedAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Monthly Payment (estimate):
                </span>
                <span className="font-semibold">
                  {formatCurrency(
                    calculateMonthlyPayment(
                      formData.amount,
                      formData.term,
                      approvalResult.suggestedInterestRate || 5
                    )
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Decision Factors:</h3>
            <ul className="list-disc list-inside text-gray-700">
              {Array.isArray(approvalResult.reasons) ? (
                approvalResult.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))
              ) : (
                <li>No specific reasons provided.</li>
              )}
            </ul>
          </div>

          {approvalResult.approved && (
            <div className="mt-6">
              <button
                className="btn btn-primary w-full py-3"
                onClick={() => navigate("/loans")}
              >
                Accept Loan Terms
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to calculate monthly payment
const calculateMonthlyPayment = (
  principal: number,
  term: number,
  interestRate: number
): number => {
  try {
    // Convert annual interest rate to monthly and decimal form
    const monthlyRate = interestRate / 100 / 12;

    // Avoid division by zero
    if (monthlyRate === 0) return principal / term;

    // Calculate monthly payment using the formula
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) /
      (Math.pow(1 + monthlyRate, term) - 1);

    return payment;
  } catch (error) {
    console.error("Error calculating monthly payment:", error);
    return 0;
  }
};

export default LoanApplication;
