package com.kanban.kanbanbackend.service;

import com.kanban.kanbanbackend.model.Board;
import com.kanban.kanbanbackend.model.Column;
import com.kanban.kanbanbackend.repository.BoardRepository;
import com.kanban.kanbanbackend.repository.ColumnRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final BoardRepository boardRepository;

    public ColumnService(ColumnRepository columnRepository, BoardRepository boardRepository) {
        this.columnRepository = columnRepository;
        this.boardRepository = boardRepository;
    }

    public List<Column> getAllColumns(Long boardId, String username) {
        boardRepository.findByIdAndUserUsername(boardId, username)
                .orElseThrow(() -> new RuntimeException("Board introuvable"));
        return columnRepository.findByBoardIdOrderByPositionAsc(boardId);
    }

    public Column createColumn(Long boardId, Column column, String username) {
        Board board = boardRepository.findByIdAndUserUsername(boardId, username)
                .orElseThrow(() -> new RuntimeException("Board introuvable"));
        long count = columnRepository.countByBoardId(boardId);
        column.setPosition((int) count);
        column.setBoard(board);
        return columnRepository.save(column);
    }

    public Optional<Column> updateColumn(Long id, Column updated, String username) {
        return columnRepository.findByIdAndBoardUserUsername(id, username).map(col -> {
            col.setName(updated.getName());
            col.setColor(updated.getColor());
            return columnRepository.save(col);
        });
    }

    public boolean deleteColumn(Long id, String username) {
        return columnRepository.findByIdAndBoardUserUsername(id, username).map(col -> {
            columnRepository.delete(col);
            return true;
        }).orElse(false);
    }
}
