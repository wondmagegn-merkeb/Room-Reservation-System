// Base Error Class for Dynamic Name Assignment
class CustomError extends Error {
    constructor(message, errorName, statusCode) {
        super(message);
        this.name = errorName || 'CustomError';  // Set the name dynamically, default to 'CustomError'
        this.statusCode = statusCode || 500;    // Set the status code dynamically, default to 500 (Internal Server Error)
    }
}

// Example: Not Found Error
export class NotFoundError extends CustomError {
    constructor(message) {
        super(message, 'NotFoundError', 404); // Dynamically set the name and status code
    }
    // This error occurs when the requested resource cannot be found on the server.
    // Example: Trying to access a URL that does not exist (e.g., a non-existent page).
}

// Example: Validation Error
export class ValidationError extends CustomError {
    constructor(message) {
        super(message, 'ValidationError', 400); // Dynamically set the name and status code
    }
    // This error occurs when the input provided by the user is invalid or does not meet the expected format.
    // Example: A user submits a form with missing required fields or an invalid email format.
}

// Example: Internal Server Error
export class InternalServerError extends CustomError {
    constructor(message) {
        super(message, 'InternalServerError', 500); // Dynamically set the name and status code
    }
    // This error occurs when there is a problem with the server, preventing it from fulfilling the request.
    // Example: A database connection failure or an unexpected exception occurring on the server.
}

// Example: Unauthorized Error
export class UnauthorizedError extends CustomError {
    constructor(message) {
        super(message, 'UnauthorizedError', 401); // Dynamically set the name and status code
    }
    // This error occurs when the client has not provided the necessary authentication credentials.
    // Example: Accessing a restricted page without logging in or providing valid API keys.
}

// Example: Forbidden Error
export class ForbiddenError extends CustomError {
    constructor(message) {
        super(message, 'ForbiddenError', 403); // Dynamically set the name and status code
    }
    // This error occurs when the server understands the request, but the client is not authorized to access the resource.
    // Example: A user trying to access an admin page without the proper permissions.
}
