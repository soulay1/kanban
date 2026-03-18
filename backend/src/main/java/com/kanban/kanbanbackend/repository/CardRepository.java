package com.kanban.kanbanbackend.repository;

import com.kanban.kanbanbackend.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByColumnIdOrderByPositionAsc(Long columnId);
    int countByColumnId(Long columnId);
}
