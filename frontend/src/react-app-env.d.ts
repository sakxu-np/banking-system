/// <reference types="react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        REACT_APP_API_BASE_URL?: string;
        // Add any other environment variables you use here
    }
}
