package com.kanban.kanbanbackend.controller;

import com.kanban.kanbanbackend.dto.UpdateProfileRequest;
import com.kanban.kanbanbackend.dto.UpdateProfileResponse;
import com.kanban.kanbanbackend.repository.UserRepository;
import com.kanban.kanbanbackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Gestion des utilisateurs")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Récupérer la liste des usernames")
    public List<String> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(u -> u.getUsername())
                .toList();
    }

    @PutMapping("/me")
    @Operation(summary = "Modifier son profil (username et/ou mot de passe)")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, Authentication auth) {
        try {
            UpdateProfileResponse response = userService.updateProfile(auth.getName(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
