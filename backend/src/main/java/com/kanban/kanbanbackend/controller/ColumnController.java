package com.kanban.kanbanbackend.controller;

import com.kanban.kanbanbackend.model.Column;
import com.kanban.kanbanbackend.service.ColumnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/columns")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Columns", description = "Gestion des colonnes du board Kanban")
public class ColumnController {

    private final ColumnService columnService;

    public ColumnController(ColumnService columnService) {
        this.columnService = columnService;
    }

    @GetMapping
    @Operation(summary = "Récupérer toutes les colonnes avec leurs cartes")
    public ResponseEntity<List<Column>> getAllColumns() {
        return ResponseEntity.ok(columnService.getAllColumns());
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle colonne")
    public ResponseEntity<Column> createColumn(@RequestBody Column column) {
        return ResponseEntity.status(HttpStatus.CREATED).body(columnService.createColumn(column));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une colonne")
    public ResponseEntity<Column> updateColumn(@PathVariable Long id, @RequestBody Column column) {
        return columnService.updateColumn(id, column)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une colonne et toutes ses cartes")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long id) {
        if (columnService.deleteColumn(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
