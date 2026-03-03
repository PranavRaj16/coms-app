
/**
 * Simple validation utility for backend controllers
 */

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Validates password strength (min 6 characters)
 */
export const validatePassword = (password: string): boolean => {
    return typeof password === 'string' && password.length >= 6;
};

/**
 * Validates mobile number (basic check)
 */
export const validateMobile = (mobile: string): boolean => {
    // Basic regex for mobile numbers (can be adjusted based on region)
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(mobile);
};

/**
 * Checks if required fields are present and not empty
 */
export const checkRequiredFields = (data: any, fields: string[]): string | null => {
    for (const field of fields) {
        if (data[field] === undefined || data[field] === null || (typeof data[field] === 'string' && data[field].trim() === '')) {
            return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
    }
    return null;
};
