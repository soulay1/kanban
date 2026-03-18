package com.kanban.kanbanbackend.service;

import com.kanban.kanbanbackend.model.Column;
import com.kanban.kanbanbackend.repository.ColumnRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ColumnService {

    private final ColumnRepository columnRepository;

    public ColumnService(ColumnRepository columnRepository) {
        this.columnRepository = columnRepository;
    }

    public List<Column> getAllColumns() {
        return columnRepository.findAllByOrderByPositionAsc();
    }

    public Column createColumn(Column column) {
        long count = columnRepository.count();
        column.setPosition((int) count);
        return columnRepository.save(column);
    }

    public Optional<Column> updateColumn(Long id, Column updated) {
        return columnRepository.findById(id).map(col -> {
            col.setName(updated.getName());
            col.setColor(updated.getColor());
            return columnRepository.save(col);
        });
    }

    public boolean deleteColumn(Long id) {
        if (columnRepository.existsById(id)) {
            columnRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
