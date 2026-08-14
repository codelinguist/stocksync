package org.dropship.stocksync.service;

import org.dropship.stocksync.vendor.StockSource;
import org.dropship.stocksync.vendor.VendorProduct;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class StockSyncSchedulerTests {

    @Test
    void continuesWithOtherVendorsWhenOneSourceFails() {
        StockSource failingSource = mock(StockSource.class);
        StockSource healthySource = mock(StockSource.class);
        InventoryService inventoryService = mock(InventoryService.class);
        List<VendorProduct> products = List.of(new VendorProduct("B-1", "Webcam", 2));

        when(failingSource.vendor()).thenReturn("VENDOR_A");
        when(failingSource.fetchStock()).thenThrow(new IllegalStateException("offline"));
        when(healthySource.vendor()).thenReturn("VENDOR_B");
        when(healthySource.fetchStock()).thenReturn(products);

        new StockSyncScheduler(List.of(failingSource, healthySource), inventoryService).synchronizeAll();

        verify(inventoryService).synchronize("VENDOR_B", products);
    }

    @Test
    void continuesWhenPersistingOneVendorFails() {
        StockSource firstSource = mock(StockSource.class);
        StockSource secondSource = mock(StockSource.class);
        InventoryService inventoryService = mock(InventoryService.class);
        List<VendorProduct> firstProducts = List.of(new VendorProduct("A-1", "Mouse", 2));
        List<VendorProduct> secondProducts = List.of(new VendorProduct("B-1", "Webcam", 3));

        when(firstSource.vendor()).thenReturn("VENDOR_A");
        when(firstSource.fetchStock()).thenReturn(firstProducts);
        when(secondSource.vendor()).thenReturn("VENDOR_B");
        when(secondSource.fetchStock()).thenReturn(secondProducts);
        doThrow(new IllegalArgumentException("bad feed"))
                .when(inventoryService).synchronize("VENDOR_A", firstProducts);

        new StockSyncScheduler(List.of(firstSource, secondSource), inventoryService).synchronizeAll();

        verify(inventoryService).synchronize("VENDOR_B", secondProducts);
    }
}
