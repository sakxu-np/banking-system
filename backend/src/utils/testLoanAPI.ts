import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test token - this should be a valid JWT token from your application
// You can get this by logging in and retrieving it from localStorage in the browser
const TEST_TOKEN = 'YOUR_TEST_TOKEN_HERE';

// API base URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
    }
});

// Test functions
const testGetLoans = async () => {
    try {
        console.log('Testing GET /loans endpoint...');
        const response = await apiClient.get('/loans');
        console.log('GET /loans response status:', response.status);
        console.log('GET /loans response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting loans:', error);
        return null;
    }
};

const testApplyForLoan = async () => {
    try {
        // This should match your LoanApplication type
        const loanData = {
            accountId: 'YOUR_TEST_ACCOUNT_ID', // Replace with a valid account ID
            loanType: 'personal',
            amount: 10000,
            term: 24,
            purpose: 'Test loan application',
            creditScore: 750
        };

        console.log('Testing POST /loans/apply endpoint...');
        console.log('Loan application data:', loanData);

        const response = await apiClient.post('/loans/apply', loanData);
        console.log('POST /loans/apply response status:', response.status);
        console.log('POST /loans/apply response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error applying for loan:', error);
        return null;
    }
};

// Run the tests
const runTests = async () => {
    console.log('=== API TESTING TOOL ===');

    // Get current loans
    console.log('\n1. Getting current loans:');
    await testGetLoans();

    // Apply for a new loan
    // Uncomment to test loan application
    // console.log('\n2. Applying for a new loan:');
    // await testApplyForLoan();

    // Get loans again to verify the new loan appears
    // console.log('\n3. Getting updated loans:');
    // await testGetLoans();
};

runTests().catch(error => console.error('Test runner error:', error));
