package org.dropship.stocksync.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "products", uniqueConstraints =
        @UniqueConstraint(name = "uk_product_vendor_sku", columnNames = {"vendor_id", "sku"}))
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Product() {
    }

    public Product(String sku, String name, int stockQuantity, Vendor vendor, Instant updatedAt) {
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

    public Vendor getVendor() {
        return vendor;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
