package org.dropship.stocksync.web;

import org.dropship.stocksync.vendor.VendorProduct;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/mock/vendor-a")
@ConditionalOnProperty(name = "vendors.vendor-a.mock-enabled", havingValue = "true")
public class MockVendorAController {

    @GetMapping("/stock")
    public List<VendorProduct> stock() {
        return List.of(
                new VendorProduct("A-100", "Wireless Mouse", 24),
                new VendorProduct("A-200", "Mechanical Keyboard", 8),
                new VendorProduct("A-300", "USB-C Hub", 0));
    }
}
