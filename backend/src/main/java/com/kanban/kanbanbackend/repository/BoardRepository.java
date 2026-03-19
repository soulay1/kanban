package com.kanban.kanbanbackend.repository;

import com.kanban.kanbanbackend.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByUserUsernameOrderByCreatedAtDesc(String username);
    Optional<Board> findByIdAndUserUsername(Long id, String username);
}
