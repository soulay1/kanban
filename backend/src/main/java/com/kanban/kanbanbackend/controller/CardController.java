package com.kanban.kanbanbackend.controller;

import com.kanban.kanbanbackend.dto.MoveCardRequest;
import com.kanban.kanbanbackend.model.Card;
import com.kanban.kanbanbackend.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Cards", description = "Gestion des cartes Kanban")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping("/column/{columnId}")
    @Operation(summary = "Créer une carte dans une colonne")
    public ResponseEntity<Card> createCard(@PathVariable Long columnId, @RequestBody Card card) {
        return cardService.createCard(columnId, card)
                .map(c -> ResponseEntity.status(HttpStatus.CREATED).body(c))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une carte")
    public ResponseEntity<Card> updateCard(@PathVariable Long id, @RequestBody Card card) {
        return cardService.updateCard(id, card)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/move")
    @Operation(summary = "Déplacer une carte vers une autre colonne")
    public ResponseEntity<Card> moveCard(@PathVariable Long id, @RequestBody MoveCardRequest request) {
        return cardService.moveCard(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une carte")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        if (cardService.deleteCard(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
