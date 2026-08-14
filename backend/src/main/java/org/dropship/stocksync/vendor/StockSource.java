package org.dropship.stocksync.vendor;

import java.util.List;

public interface StockSource {
    String vendor();

    List<VendorProduct> fetchStock();
}
