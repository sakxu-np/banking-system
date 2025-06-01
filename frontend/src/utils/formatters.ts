/**
 * Format currency based on currency code
 * Provides special formatting for NPR (Nepali Rupee) using the Nepali locale
 * NPR is set as the default currency for the application
 */
export const formatCurrency = (amount: number, currency: string = 'NPR'): string => {
    // Special handling for Nepali Rupee
    if (currency === 'NPR') {
        return `रू ${amount.toLocaleString('ne-NP')}`;
    }

    // Standard currency formatting for other currencies
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

/**
 * Get currency symbol based on currency code
 */
export const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
        case 'NPR':
            return 'रू';
        case 'USD':
            return '$';
        case 'EUR':
            return '€';
        case 'GBP':
            return '£';
        case 'JPY':
            return '¥';
        default:
            return 'रू';  // Default to Nepali Rupee symbol
    }
};

/**
 * Format date to localized string
 */
export const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (e) {
        return 'Invalid date';
    }
};
