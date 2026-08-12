package org.dropship.stocksync.repository;

import org.dropship.stocksync.domain.OutOfStockEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutOfStockEventRepository extends JpaRepository<OutOfStockEvent, Long> {
}
