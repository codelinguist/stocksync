package org.dropship.stocksync.service;

import org.dropship.stocksync.domain.Product;

import java.time.Instant;

public record ProductResponse(Long id, String sku, String name, int stockQuantity, String vendor, Instant updatedAt) {
    static ProductResponse from(Product product) {
        return new ProductResponse(product.getId(), product.getSku(), product.getName(), product.getStockQuantity(),
                product.getVendor().getName(), product.getUpdatedAt());
    }
}
