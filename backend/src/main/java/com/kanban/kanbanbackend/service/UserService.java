package com.kanban.kanbanbackend.service;

import com.kanban.kanbanbackend.dto.UpdateProfileRequest;
import com.kanban.kanbanbackend.dto.UpdateProfileResponse;
import com.kanban.kanbanbackend.model.User;
import com.kanban.kanbanbackend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UpdateProfileResponse updateProfile(String currentUsername, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe actuel incorrect");
        }

        boolean changed = false;

        if (request.getNewUsername() != null && !request.getNewUsername().isBlank()
                && !request.getNewUsername().equals(currentUsername)) {
            if (userRepository.existsByUsername(request.getNewUsername())) {
                throw new RuntimeException("Ce nom d'utilisateur est déjà pris");
            }
            user.setUsername(request.getNewUsername());
            changed = true;
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("Aucune modification détectée");
        }

        userRepository.save(user);
        String newToken = jwtService.generateToken(user.getUsername());
        return new UpdateProfileResponse(newToken, user.getUsername());
    }
}
