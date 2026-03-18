package com.kanban.kanbanbackend.dto;

public class MoveCardRequest {
    private Long targetColumnId;
    private int position;

    public Long getTargetColumnId() { return targetColumnId; }
    public void setTargetColumnId(Long targetColumnId) { this.targetColumnId = targetColumnId; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
}
