package org.dropship.stocksync.domain;


import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Instant;

public class Product {

    private Long id;

    private String sku;

    private String name;

    private int stockQuantity;

    private String vendor;

    private Instant updatedAt;

    protected Product() {
    }

    public Product(String sku, String name, int stockQuantity, String vendor, Instant updatedAt) {
        this.sku = sku;
        this.name = name;
        this.stockQuantity = stockQuantity;
        this.vendor = vendor;
        this.updatedAt = updatedAt;
    }

    public void update(String name, int stockQuantity, Instant updatedAt) {
        this.name = name;
        this.stockQuantity = stockQuantity;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getSku() {
        return sku;
    }

    public String getName() {
        return name;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public String getVendor() {
        return vendor;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

