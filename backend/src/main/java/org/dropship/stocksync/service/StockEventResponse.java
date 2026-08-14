package org.dropship.stocksync.service;

import org.dropship.stocksync.domain.OutOfStockEvent;

import java.time.Instant;

public record StockEventResponse(Long id, String sku, String productName, String vendor, int currentQuantity,
                                 Instant eventTime) {
    static StockEventResponse from(OutOfStockEvent event) {
        return new StockEventResponse(event.getId(), event.getProduct().getSku(), event.getProduct().getName(),
                event.getProduct().getVendor().getName(), event.getProduct().getStockQuantity(), event.getEventTime());
    }
}
