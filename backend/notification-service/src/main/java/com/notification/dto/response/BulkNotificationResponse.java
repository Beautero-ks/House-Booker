package com.notification.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkNotificationResponse {
    private int totalRequested;

    @Builder.Default
    private List<UUID> successfulIds = new ArrayList<>();

    @Builder.Default
    private Map<UUID, String> failures = new HashMap<>();

    public int getSuccessCount() {
        return successfulIds.size();
    }

    public int getFailedCount() {
        return failures.size();
    }

    public void addSuccess(UUID id) {
        successfulIds.add(id);
    }

    public void addFailure(UUID userId, String reason) {
        failures.put(userId, reason);
    }
}