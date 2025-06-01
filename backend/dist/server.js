"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const accountRoutes_1 = __importDefault(require("./routes/accountRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const loanRoutes_1 = __importDefault(require("./routes/loanRoutes"));
const investmentRoutes_1 = __importDefault(require("./routes/investmentRoutes"));
const budgetRoutes_1 = __importDefault(require("./routes/budgetRoutes"));
const chatbotRoutes_1 = __importDefault(require("./routes/chatbotRoutes"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/accounts', accountRoutes_1.default);
app.use('/api/transactions', transactionRoutes_1.default);
app.use('/api/loans', loanRoutes_1.default);
app.use('/api/investments', investmentRoutes_1.default);
app.use('/api/budgets', budgetRoutes_1.default);
app.use('/api/support', chatbotRoutes_1.default);
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-banking';
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});
// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try using a different port.`);
        console.log('You can specify a different port using the PORT environment variable:');
        console.log('  PORT=5002 npm start');
        process.exit(1);
    }
    else {
        console.error('Server error:', e);
    }
});
