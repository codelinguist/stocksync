package org.dropship.stocksync.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.dropship.stocksync.service.StockSyncScheduler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sync")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
@Tag(name = "Synchronization", description = "Inventory synchronization operations")
public class SyncController {

    private final StockSyncScheduler stockSyncScheduler;

    public SyncController(StockSyncScheduler stockSyncScheduler) {
        this.stockSyncScheduler = stockSyncScheduler;
    }

    @PostMapping
    @Operation(summary = "Synchronize inventory from all configured vendors")
    @ApiResponse(responseCode = "204", description = "Synchronization completed")
    public ResponseEntity<Void> synchronize() {
        stockSyncScheduler.synchronizeAll();
        return ResponseEntity.noContent().build();
    }
}
