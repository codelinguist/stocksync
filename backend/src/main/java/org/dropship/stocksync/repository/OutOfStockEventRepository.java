package org.dropship.stocksync.repository;

import org.dropship.stocksync.domain.OutOfStockEvent;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutOfStockEventRepository extends JpaRepository<OutOfStockEvent, Long> {
    @EntityGraph(attributePaths = {"product", "product.vendor"})
    List<OutOfStockEvent> findAllByOrderByEventTimeDesc();
}
