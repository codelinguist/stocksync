package org.dropship.stocksync.web;

import org.dropship.stocksync.service.InventoryService;
import org.dropship.stocksync.service.ProductResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(name = "Products", description = "Latest normalized vendor inventory")
public class ProductController {

    private final InventoryService inventoryService;

    public ProductController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @Operation(summary = "List the latest stock for all vendor products")
    @ApiResponse(responseCode = "200", description = "Current products returned")
    public ResponseEntity<List<ProductResponse>> findAll() {
        return ResponseEntity.ok(inventoryService.findAll());
    }
}
