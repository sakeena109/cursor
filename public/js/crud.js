// Common CRUD operations JavaScript

// Generic function to handle API errors
function handleApiError(error, defaultMessage = 'An error occurred') {
    console.error('API Error:', error);
    return {
        success: false,
        message: error.message || defaultMessage
    };
}

// Generic delete confirmation
function confirmDelete(itemName) {
    return confirm(`Are you sure you want to delete ${itemName}? This action cannot be undone.`);
}

