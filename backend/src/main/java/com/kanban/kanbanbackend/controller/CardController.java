package com.kanban.kanbanbackend.controller;

import com.kanban.kanbanbackend.dto.MoveCardRequest;
import com.kanban.kanbanbackend.model.Card;
import com.kanban.kanbanbackend.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
@Tag(name = "Cards", description = "Gestion des cartes Kanban")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping("/column/{columnId}")
    @Operation(summary = "Créer une carte dans une colonne")
    public ResponseEntity<Card> createCard(@PathVariable Long columnId, @RequestBody Card card, Authentication auth) {
        return cardService.createCard(columnId, card, auth.getName())
                .map(c -> ResponseEntity.status(HttpStatus.CREATED).body(c))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une carte")
    public ResponseEntity<Card> updateCard(@PathVariable Long id, @RequestBody Card card, Authentication auth) {
        return cardService.updateCard(id, card, auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/move")
    @Operation(summary = "Déplacer une carte vers une autre colonne")
    public ResponseEntity<Card> moveCard(@PathVariable Long id, @RequestBody MoveCardRequest request, Authentication auth) {
        return cardService.moveCard(id, request, auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une carte")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id, Authentication auth) {
        if (cardService.deleteCard(id, auth.getName())) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
