package com.sece.parkspot.exception;

public class ProjectNotFoundException extends RuntimeException {

    // Default constructor
    public ProjectNotFoundException() {
        super();
    }

    // Constructor with custom message
    public ProjectNotFoundException(String message) {
        super(message);
    }
}
