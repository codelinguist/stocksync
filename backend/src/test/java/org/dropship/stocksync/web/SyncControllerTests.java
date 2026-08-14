package org.dropship.stocksync.web;

import org.dropship.stocksync.service.StockSyncScheduler;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SyncControllerTests {

    @Test
    void delegatesManualSynchronizationToTheScheduledOrchestration() throws Exception {
        StockSyncScheduler stockSyncScheduler = mock(StockSyncScheduler.class);
        SyncController controller = new SyncController(stockSyncScheduler);

        MockMvcBuilders.standaloneSetup(controller)
                .addPlaceholderValue("app.cors.allowed-origin", "http://localhost:3000")
                .build()
                .perform(post("/sync"))
                .andExpect(status().isNoContent());

        verify(stockSyncScheduler).synchronizeAll();
    }
}
