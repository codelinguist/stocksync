package org.dropship.stocksync.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.dropship.stocksync.service.InventoryService;
import org.dropship.stocksync.service.StockEventResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/stock-events")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
@Tag(name = "Stock events", description = "Recorded positive-to-zero stock transitions")
public class StockEventController {

    private final InventoryService inventoryService;

    public StockEventController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @Operation(summary = "List positive-to-zero stock transitions, most recent first")
    @ApiResponse(responseCode = "200", description = "Recorded stock events returned")
    public ResponseEntity<List<StockEventResponse>> findAll() {
        return ResponseEntity.ok(inventoryService.findStockEvents());
    }
}
