package com.intergiciel.auth_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPage {
    private List<UserInfo> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
