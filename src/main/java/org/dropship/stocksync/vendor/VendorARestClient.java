package org.dropship.stocksync.vendor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Component
public class VendorARestClient implements StockSource {

    private final RestClient restClient;
    private final String stockPath;

    public VendorARestClient(RestClient.Builder builder,
                             @Value("${vendors.vendor-a.base-url}") String baseUrl,
                             @Value("${vendors.vendor-a.stock-path}") String stockPath) {
        this.restClient = builder.baseUrl(baseUrl).build();
        this.stockPath = stockPath;
    }

    @Override
    public String vendor() {
        return "VENDOR_A";
    }

    @Override
    @Retryable(retryFor = RestClientException.class, maxAttemptsExpression = "${vendors.vendor-a.retry.max-attempts}",
            backoff = @Backoff(delayExpression = "${vendors.vendor-a.retry.delay-ms}"))
    public List<VendorProduct> fetchStock() {
        List<VendorProduct> response = restClient.get()
                .uri(stockPath)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
        return response == null ? List.of() : response;
    }
}
