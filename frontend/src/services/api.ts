import axios from 'axios';

// TypeScript should now recognize process.env with our type declarations
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Create an instance of axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add the JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development mode
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.error('API Error:', error);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login if token is invalid/expired
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

interface AuthCredentials {
  email: string;
  password: string;
}

interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
}

// Auth API
export const authAPI = {
  register: (userData: RegisterUserData) => apiClient.post('/auth/register', userData),
  login: (credentials: AuthCredentials) => apiClient.post('/auth/login', credentials)
};

// User API
export const userAPI = {
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (userData: any) => apiClient.put('/users/me', userData),
  getAllUsers: () => apiClient.get('/users'), // Admin-only endpoint
  getUserById: (id: string) => apiClient.get(`/users/${id}`), // Admin-only endpoint
  updateUser: (id: string, userData: any) => apiClient.put(`/users/${id}`, userData), // Admin-only endpoint
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`) // Admin-only endpoint
};

interface CreateAccountData {
  accountType: 'checking' | 'savings' | 'credit';
  currency: string;
  initialBalance?: number;
}

interface TransactionParams {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  type?: string;
}

interface CreateTransactionData {
  accountId: string;
  receiverAccountId?: string;
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  description: string;
}

// Account API
export const accountsAPI = {
  getAll: () => apiClient.get('/accounts'),
  getById: (id: string) => apiClient.get(`/accounts/${id}`),
  create: (accountData: CreateAccountData) => apiClient.post('/accounts', accountData),
  // Admin-specific endpoints
  getAllAccounts: () => apiClient.get('/admin/accounts'),
  updateAccount: (id: string, accountData: any) => apiClient.put(`/admin/accounts/${id}`, accountData),
  toggleAccountStatus: (id: string, isActive: boolean) => apiClient.patch(`/admin/accounts/${id}/status`, { isActive })
};

// Transaction API
export const transactionsAPI = {
  getByAccountId: (accountId: string, params?: TransactionParams) =>
    apiClient.get(`/transactions/account/${accountId}`, { params }),
  create: (transactionData: CreateTransactionData) =>
    apiClient.post('/transactions', transactionData)
};

interface LoanApplicationData {
  accountId: string;
  loanType: 'personal' | 'home' | 'auto' | 'education' | 'business';
  amount: number;
  term: number;
  purpose: string;
  creditScore?: number;
}

interface BudgetData {
  name: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  categories: Array<{
    name: string;
    limit: number;
    color: string;
  }>;
}

// Loan API
export const loanAPI = {
  getUserLoans: () => apiClient.get('/loans'),
  getLoanById: (id: string) => apiClient.get(`/loans/${id}`),
  applyForLoan: (loanData: LoanApplicationData) => apiClient.post('/loans/apply', loanData)
};

// Investment API
export const investmentAPI = {
  getUserInvestments: () => apiClient.get('/investments'),
  getInvestmentById: (id: string) => apiClient.get(`/investments/${id}`)
};

// Budget API
export const budgetAPI = {
  getUserBudgets: () => apiClient.get('/budgets'),
  getBudgetById: (id: string) => apiClient.get(`/budgets/${id}`),
  createBudget: (budgetData: BudgetData) => apiClient.post('/budgets', budgetData),
  updateBudget: (id: string, budgetData: Partial<BudgetData>) => apiClient.put(`/budgets/${id}`, budgetData)
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message: string) => apiClient.post('/support/chat', { message })
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: () => apiClient.get('/dashboard/data'),
  getBalanceHistory: () => apiClient.get('/dashboard/balance-history'),
  getIncomeExpenses: () => apiClient.get('/dashboard/income-expenses'),
  getSpendingCategories: () => apiClient.get('/dashboard/spending-categories')
};

export default apiClient;