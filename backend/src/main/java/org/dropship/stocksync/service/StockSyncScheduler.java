package org.dropship.stocksync.service;

import org.dropship.stocksync.vendor.StockSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(StockSyncScheduler.class);

    private final List<StockSource> stockSources;
    private final InventoryService inventoryService;

    public StockSyncScheduler(List<StockSource> stockSources, InventoryService inventoryService) {
        this.stockSources = stockSources;
        this.inventoryService = inventoryService;
    }

    @Scheduled(fixedDelayString = "${stock-sync.fixed-delay-ms}",
            initialDelayString = "${stock-sync.initial-delay-ms}")
    public void synchronizeAll() {
        for (StockSource source : stockSources) {
            try {
                var products = source.fetchStock();
                inventoryService.synchronize(source.vendor(), products);
                log.info("Stock sync completed: vendor={}, products={}", source.vendor(), products.size());
            } catch (Exception exception) {
                log.error("Stock sync failed for vendor={}; other vendors will continue", source.vendor(), exception);
            }
        }
    }
}
