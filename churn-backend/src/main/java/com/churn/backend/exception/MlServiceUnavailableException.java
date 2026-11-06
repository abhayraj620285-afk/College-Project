package com.churn.backend.exception;

/** Thrown when the Python model service cannot be reached or returns an error. */
public class MlServiceUnavailableException extends RuntimeException {
    public MlServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
