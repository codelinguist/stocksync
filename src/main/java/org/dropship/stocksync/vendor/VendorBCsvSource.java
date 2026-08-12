package org.dropship.stocksync.vendor;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
public class VendorBCsvSource implements StockSource {

    private final Path stockFile;

    public VendorBCsvSource(@Value("${vendors.vendor-b.file-path}") String stockFile) {
        this.stockFile = Path.of(stockFile);
    }

    @Override
    public String vendor() {
        return "VENDOR_B";
    }

    @Override
    public List<VendorProduct> fetchStock() {
        if (!Files.isRegularFile(stockFile)) {
            throw new StockSourceException("Vendor B stock file does not exist: " + stockFile);
        }

        try (Reader reader = Files.newBufferedReader(stockFile, StandardCharsets.UTF_8)) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.builder()
                    .setHeader("sku", "name", "stockQuantity")
                    .setSkipHeaderRecord(true)
                    .setIgnoreSurroundingSpaces(true)
                    .get()
                    .parse(reader);
            List<VendorProduct> products = new ArrayList<>();
            for (CSVRecord record : records) {
                products.add(new VendorProduct(
                        record.get("sku"),
                        record.get("name"),
                        Integer.parseInt(record.get("stockQuantity"))));
            }
            return products;
        } catch (IOException | IllegalArgumentException exception) {
            throw new StockSourceException("Unable to read Vendor B stock file: " + stockFile, exception);
        }
    }
}
