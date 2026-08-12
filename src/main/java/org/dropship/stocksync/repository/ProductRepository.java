package org.dropship.stocksync.repository;

import org.dropship.stocksync.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByVendorNameAndSku(String vendorName, String sku);

    List<Product> findAllByOrderByVendorNameAscSkuAsc();
}
