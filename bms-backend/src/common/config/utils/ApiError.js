class ApiError extends Error {
    constructor(statusCode, message) {
        let resolvedStatusCode = statusCode
        let resolvedMessage = message

        if (typeof statusCode === "string") {
            resolvedStatusCode = message
            resolvedMessage = statusCode
        }

        super(resolvedMessage || "Internal server error")
        this.statusCode = Number.isInteger(resolvedStatusCode) ? resolvedStatusCode : 500
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor)
    }

    static badRequest(message = "Bad request") {
        return new ApiError(400, message)
    }

    static unauthorized(message = "Unauthorized") {
        return new ApiError(401, message)
    }

    static forbidden(message = "Forbidden") {
        return new ApiError(403, message)
    }

    static conflict(message = "Conflict") {
        return new ApiError(409, message)
    }

    static notFound(message = "Not found") {
        return new ApiError(404, message)
    }

    static internal(message = "Internal server error") {
        return new ApiError(500, message)
    }

}

export default ApiError
