package org.dropship.stocksync.service;

import org.dropship.stocksync.domain.OutOfStockEvent;
import org.dropship.stocksync.domain.Product;
import org.dropship.stocksync.domain.Vendor;
import org.dropship.stocksync.repository.OutOfStockEventRepository;
import org.dropship.stocksync.repository.ProductRepository;
import org.dropship.stocksync.repository.VendorRepository;
import org.dropship.stocksync.vendor.VendorProduct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final ProductRepository productRepository;
    private final OutOfStockEventRepository eventRepository;
    private final VendorRepository vendorRepository;
    private final Clock clock;

    @Autowired
    public InventoryService(ProductRepository productRepository, OutOfStockEventRepository eventRepository,
                            VendorRepository vendorRepository) {
        this(productRepository, eventRepository, vendorRepository, Clock.systemUTC());
    }

    InventoryService(ProductRepository productRepository, OutOfStockEventRepository eventRepository,
                     VendorRepository vendorRepository, Clock clock) {
        this.productRepository = productRepository;
        this.eventRepository = eventRepository;
        this.vendorRepository = vendorRepository;
        this.clock = clock;
    }

    @Transactional
    public void synchronize(String vendor, List<VendorProduct> incomingProducts) {
        String normalizedVendor = requireText(vendor, "vendor").toUpperCase();
        Vendor vendorEntity = vendorRepository.findByName(normalizedVendor)
                .orElseGet(() -> vendorRepository.save(new Vendor(normalizedVendor)));
        for (VendorProduct incoming : incomingProducts) {
            upsert(vendorEntity, incoming);
        }
    }

    private void upsert(Vendor vendor, VendorProduct incoming) {
        String sku = requireText(incoming.sku(), "sku");
        String name = requireText(incoming.name(), "name");
        if (incoming.stockQuantity() < 0) {
            throw new IllegalArgumentException("stockQuantity must be zero or greater for " + vendor.getName() + "/" + sku);
        }

        Instant now = clock.instant();
        Product product = productRepository.findByVendorNameAndSku(vendor.getName(), sku).orElse(null);
        if (product == null) {
            productRepository.save(new Product(sku, name, incoming.stockQuantity(), vendor, now));
            return;
        }

        if (product.getStockQuantity() > 0 && incoming.stockQuantity() == 0) {
            eventRepository.save(new OutOfStockEvent(product, now));
            log.warn("Product went out of stock: vendor={}, sku={}", vendor.getName(), sku);
        }
        product.update(name, incoming.stockQuantity(), now);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAll() {
        return productRepository.findAllByOrderByVendorNameAscSkuAsc()
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    private String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.trim();
    }
}
