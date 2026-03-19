package com.kanban.kanbanbackend.controller;

import com.kanban.kanbanbackend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
@Tag(name = "Users", description = "Liste des utilisateurs")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Récupérer la liste des usernames")
    public List<String> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(u -> u.getUsername())
                .toList();
    }
}
