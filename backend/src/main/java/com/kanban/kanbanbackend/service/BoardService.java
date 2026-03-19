package com.kanban.kanbanbackend.service;

import com.kanban.kanbanbackend.model.Board;
import com.kanban.kanbanbackend.model.User;
import com.kanban.kanbanbackend.repository.BoardRepository;
import com.kanban.kanbanbackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    public BoardService(BoardRepository boardRepository, UserRepository userRepository) {
        this.boardRepository = boardRepository;
        this.userRepository = userRepository;
    }

    public List<Board> getAllBoards(String username) {
        return boardRepository.findByUserUsernameOrderByCreatedAtDesc(username);
    }

    public Board createBoard(Board board, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));
        board.setUser(user);
        return boardRepository.save(board);
    }

    public Optional<Board> updateBoard(Long id, Board updated, String username) {
        return boardRepository.findByIdAndUserUsername(id, username).map(board -> {
            board.setName(updated.getName());
            board.setDescription(updated.getDescription());
            return boardRepository.save(board);
        });
    }

    public boolean deleteBoard(Long id, String username) {
        return boardRepository.findByIdAndUserUsername(id, username).map(board -> {
            boardRepository.delete(board);
            return true;
        }).orElse(false);
    }

    public Optional<Board> getBoardById(Long id, String username) {
        return boardRepository.findByIdAndUserUsername(id, username);
    }
}
