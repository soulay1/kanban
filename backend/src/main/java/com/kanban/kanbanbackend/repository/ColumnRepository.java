package com.kanban.kanbanbackend.repository;

import com.kanban.kanbanbackend.model.Column;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ColumnRepository extends JpaRepository<Column, Long> {
    List<Column> findByBoardIdOrderByPositionAsc(Long boardId);
    long countByBoardId(Long boardId);
    Optional<Column> findByIdAndBoardIdAndBoardUserUsername(Long id, Long boardId, String username);
    Optional<Column> findByIdAndBoardUserUsername(Long id, String username);
}
