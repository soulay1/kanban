package com.kanban.kanbanbackend.repository;

import com.kanban.kanbanbackend.model.Column;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColumnRepository extends JpaRepository<Column, Long> {
    List<Column> findAllByOrderByPositionAsc();
}
