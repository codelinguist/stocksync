package org.dropship.stocksync.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "out_of_stock_events")
public class OutOfStockEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Instant eventTime;

    protected OutOfStockEvent() {
    }

    public OutOfStockEvent(Product product, Instant eventTime) {
        this.product = product;
        this.eventTime = eventTime;
    }

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public Instant getEventTime() {
        return eventTime;
    }
}
