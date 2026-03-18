package com.kanban.kanbanbackend.service;

import com.kanban.kanbanbackend.model.Column;
import com.kanban.kanbanbackend.model.User;
import com.kanban.kanbanbackend.repository.ColumnRepository;
import com.kanban.kanbanbackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final UserRepository userRepository;

    public ColumnService(ColumnRepository columnRepository, UserRepository userRepository) {
        this.columnRepository = columnRepository;
        this.userRepository = userRepository;
    }

    public List<Column> getAllColumns(String username) {
        return columnRepository.findByUserUsernameOrderByPositionAsc(username);
    }

    public Column createColumn(Column column, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));
        long count = columnRepository.countByUserUsername(username);
        column.setPosition((int) count);
        column.setUser(user);
        return columnRepository.save(column);
    }

    public Optional<Column> updateColumn(Long id, Column updated, String username) {
        return columnRepository.findByIdAndUserUsername(id, username).map(col -> {
            col.setName(updated.getName());
            col.setColor(updated.getColor());
            return columnRepository.save(col);
        });
    }

    public boolean deleteColumn(Long id, String username) {
        return columnRepository.findByIdAndUserUsername(id, username).map(col -> {
            columnRepository.delete(col);
            return true;
        }).orElse(false);
    }
}
