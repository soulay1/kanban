package com.kanban.kanbanbackend.controller;

import com.kanban.kanbanbackend.model.Column;
import com.kanban.kanbanbackend.service.ColumnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/columns")
@Tag(name = "Columns", description = "Gestion des colonnes d'un board")
public class ColumnController {

    private final ColumnService columnService;

    public ColumnController(ColumnService columnService) {
        this.columnService = columnService;
    }

    @GetMapping
    @Operation(summary = "Récupérer les colonnes d'un board")
    public ResponseEntity<List<Column>> getAllColumns(@PathVariable Long boardId, Authentication auth) {
        return ResponseEntity.ok(columnService.getAllColumns(boardId, auth.getName()));
    }

    @PostMapping
    @Operation(summary = "Créer une colonne dans un board")
    public ResponseEntity<Column> createColumn(@PathVariable Long boardId, @RequestBody Column column, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(columnService.createColumn(boardId, column, auth.getName()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une colonne")
    public ResponseEntity<Column> updateColumn(@PathVariable Long boardId, @PathVariable Long id, @RequestBody Column column, Authentication auth) {
        return columnService.updateColumn(id, column, auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une colonne et toutes ses cartes")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long boardId, @PathVariable Long id, Authentication auth) {
        if (columnService.deleteColumn(id, auth.getName())) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
