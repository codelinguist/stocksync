package org.dropship.stocksync.domain.repository;

import org.dropship.stocksync.domain.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByVendorNameAndSku(String vendorName, String sku);
}
