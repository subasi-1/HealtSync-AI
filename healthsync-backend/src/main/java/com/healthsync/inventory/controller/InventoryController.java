package com.healthsync.inventory.controller;

import com.healthsync.common.ApiResponse;
import com.healthsync.inventory.entity.Inventory;
import com.healthsync.inventory.repository.InventoryRepository;
import com.healthsync.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Endpoints for managing medical inventory and stocks")
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository;

    @GetMapping
    @Operation(summary = "Get list of inventory items, optionally filtered by health center")
    public ResponseEntity<ApiResponse<List<Inventory>>> getInventory(@RequestParam(required = false) UUID hospitalId) {
        List<Inventory> list = hospitalId != null 
                ? inventoryService.getInventoryByHealthCenter(hospitalId) 
                : inventoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(list, "Inventory fetched successfully"));
    }

    @PutMapping("/{id}/stock")
    @Operation(summary = "Update stock level of an inventory item")
    public ResponseEntity<ApiResponse<Inventory>> updateStock(@PathVariable UUID id, @RequestBody StockUpdateRequest request) {
        Inventory inv = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        inv.setQuantity(request.getStockLevel());
        Inventory updated = inventoryRepository.save(inv);
        return ResponseEntity.ok(ApiResponse.success(updated, "Stock level updated successfully"));
    }

    @Data
    public static class StockUpdateRequest {
        private Integer stockLevel;
    }
}
