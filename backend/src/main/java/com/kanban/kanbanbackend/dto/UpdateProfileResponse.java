package com.kanban.kanbanbackend.dto;

public class UpdateProfileResponse {
    private String token;
    private String username;

    public UpdateProfileResponse(String token, String username) {
        this.token = token;
        this.username = username;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
}
