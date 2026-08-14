package org.dropship.stocksync.vendor;

public class StockSourceException extends RuntimeException {
    public StockSourceException(String message) {
        super(message);
    }

    public StockSourceException(String message, Throwable cause) {
        super(message, cause);
    }
}
