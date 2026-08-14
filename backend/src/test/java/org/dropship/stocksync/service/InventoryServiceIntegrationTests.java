package org.dropship.stocksync.service;

import org.dropship.stocksync.repository.OutOfStockEventRepository;
import org.dropship.stocksync.repository.ProductRepository;
import org.dropship.stocksync.repository.VendorRepository;
import org.dropship.stocksync.vendor.VendorProduct;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = {
        "stock-sync.initial-delay-ms=3600000",
        "vendors.vendor-a.mock-enabled=false"
})
class InventoryServiceIntegrationTests {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OutOfStockEventRepository eventRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @BeforeEach
    void clearDatabase() {
        eventRepository.deleteAll();
        productRepository.deleteAll();
        vendorRepository.deleteAll();
    }

    @Test
    void upsertsProductsAndKeepsTheSameSkuSeparateByVendor() {
        inventoryService.synchronize("vendor_a", List.of(
                new VendorProduct("SHARED", "Mouse", 5),
                new VendorProduct("A-2", "Keyboard", 2)));
        inventoryService.synchronize("vendor_b", List.of(
                new VendorProduct("SHARED", "Webcam", 9)));
        inventoryService.synchronize("vendor_a", List.of(
                new VendorProduct("SHARED", "Wireless Mouse", 7)));

        assertThat(inventoryService.findAll())
                .extracting(ProductResponse::vendor, ProductResponse::sku,
                        ProductResponse::name, ProductResponse::stockQuantity)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("VENDOR_A", "A-2", "Keyboard", 2),
                        org.assertj.core.groups.Tuple.tuple("VENDOR_A", "SHARED", "Wireless Mouse", 7),
                        org.assertj.core.groups.Tuple.tuple("VENDOR_B", "SHARED", "Webcam", 9));
    }

    @Test
    void recordsOnlyPositiveToZeroTransitions() {
        inventoryService.synchronize("VENDOR_A", List.of(new VendorProduct("A-1", "Mouse", 0)));
        inventoryService.synchronize("VENDOR_A", List.of(new VendorProduct("A-1", "Mouse", 3)));
        inventoryService.synchronize("VENDOR_A", List.of(new VendorProduct("A-1", "Mouse", 0)));
        inventoryService.synchronize("VENDOR_A", List.of(new VendorProduct("A-1", "Mouse", 0)));
        inventoryService.synchronize("VENDOR_A", List.of(new VendorProduct("A-1", "Mouse", 1)));
        inventoryService.synchronize("VENDOR_A", List.of(new VendorProduct("A-1", "Mouse", 0)));

        assertThat(eventRepository.count()).isEqualTo(2);
    }

    @Test
    void retainsProductsThatAreMissingFromALaterFeed() {
        inventoryService.synchronize("VENDOR_A", List.of(
                new VendorProduct("A-1", "Mouse", 4),
                new VendorProduct("A-2", "Keyboard", 6)));

        inventoryService.synchronize("VENDOR_A", List.of(new VendorProduct("A-1", "Mouse", 3)));

        assertThat(inventoryService.findAll()).extracting(ProductResponse::sku)
                .containsExactly("A-1", "A-2");
    }

    @Test
    void rejectsInvalidStockWithoutCommittingAnyRowsFromThatFeed() {
        assertThatThrownBy(() -> inventoryService.synchronize("VENDOR_A", List.of(
                new VendorProduct("A-1", "Mouse", 4),
                new VendorProduct("A-2", "Keyboard", -1))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("stockQuantity");

        assertThat(productRepository.count()).isZero();
        assertThat(vendorRepository.count()).isZero();
    }
}
