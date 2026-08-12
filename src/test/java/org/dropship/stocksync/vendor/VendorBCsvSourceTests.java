package org.dropship.stocksync.vendor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class VendorBCsvSourceTests {

    @TempDir
    Path tempDirectory;

    @Test
    void parsesQuotedNamesAndWhitespace() throws IOException {
        Path stockFile = tempDirectory.resolve("stock.csv");
        Files.writeString(stockFile, """
                sku,name,stockQuantity
                B-100,"Webcam, 4K",12
                 B-200 , Keyboard , 3
                """);

        assertThat(new VendorBCsvSource(stockFile.toString()).fetchStock())
                .containsExactly(
                        new VendorProduct("B-100", "Webcam, 4K", 12),
                        new VendorProduct("B-200", "Keyboard", 3));
    }

    @Test
    void reportsAMissingDropAsAStockSourceFailure() {
        Path missingFile = tempDirectory.resolve("missing.csv");

        assertThatThrownBy(() -> new VendorBCsvSource(missingFile.toString()).fetchStock())
                .isInstanceOf(StockSourceException.class)
                .hasMessageContaining(missingFile.toString());
    }
}
