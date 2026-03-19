package com.kanban.kanbanbackend.controller;

import com.kanban.kanbanbackend.model.Board;
import com.kanban.kanbanbackend.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
@Tag(name = "Boards", description = "Gestion des boards Kanban")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    @Operation(summary = "Récupérer tous les boards de l'utilisateur")
    public ResponseEntity<List<Board>> getAllBoards(Authentication auth) {
        return ResponseEntity.ok(boardService.getAllBoards(auth.getName()));
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau board")
    public ResponseEntity<Board> createBoard(@RequestBody Board board, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(boardService.createBoard(board, auth.getName()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un board")
    public ResponseEntity<Board> updateBoard(@PathVariable Long id, @RequestBody Board board, Authentication auth) {
        return boardService.updateBoard(id, board, auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un board et tout son contenu")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id, Authentication auth) {
        if (boardService.deleteBoard(id, auth.getName())) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
