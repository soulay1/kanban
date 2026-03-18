package com.kanban.kanbanbackend.service;

import com.kanban.kanbanbackend.dto.MoveCardRequest;
import com.kanban.kanbanbackend.model.Card;
import com.kanban.kanbanbackend.model.Column;
import com.kanban.kanbanbackend.repository.CardRepository;
import com.kanban.kanbanbackend.repository.ColumnRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final ColumnRepository columnRepository;

    public CardService(CardRepository cardRepository, ColumnRepository columnRepository) {
        this.cardRepository = cardRepository;
        this.columnRepository = columnRepository;
    }

    public Optional<Card> createCard(Long columnId, Card card) {
        return columnRepository.findById(columnId).map(column -> {
            int count = cardRepository.countByColumnId(columnId);
            card.setColumn(column);
            card.setPosition(count);
            return cardRepository.save(card);
        });
    }

    public Optional<Card> updateCard(Long id, Card updated) {
        return cardRepository.findById(id).map(card -> {
            card.setTitle(updated.getTitle());
            card.setDescription(updated.getDescription());
            card.setPriority(updated.getPriority());
            card.setTag(updated.getTag());
            return cardRepository.save(card);
        });
    }

    public Optional<Card> moveCard(Long id, MoveCardRequest request) {
        return cardRepository.findById(id).map(card -> {
            Column targetColumn = columnRepository.findById(request.getTargetColumnId())
                    .orElseThrow(() -> new RuntimeException("Column not found"));
            card.setColumn(targetColumn);
            card.setPosition(request.getPosition());
            return cardRepository.save(card);
        });
    }

    public boolean deleteCard(Long id) {
        if (cardRepository.existsById(id)) {
            cardRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
