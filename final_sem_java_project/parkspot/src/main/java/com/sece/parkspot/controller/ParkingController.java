package com.sece.parkspot.controller;

import com.sece.parkspot.dto.EntryRequest;
import com.sece.parkspot.dto.ParkingSlotResponse;
import com.sece.parkspot.entity.ParkingSlot;
import com.sece.parkspot.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/parkspot")
public class ParkingController {

    @Autowired
    private ParkingService parkingService;

    // Log Entry
    @PostMapping("/entry")
    public ResponseEntity<ParkingSlotResponse> logEntry(@RequestBody EntryRequest request) {
        ParkingSlot slot = parkingService.logEntry(
                request.getVehicleNumber(),
                request.getFlatVisited(),
                request.getSlotNumber()
        );
        return ResponseEntity.ok(convertToResponse(slot));
    }

    // Log Exit
    @PutMapping("/exit/{id}")
    public ResponseEntity<ParkingSlotResponse> logExit(@PathVariable Long id) {
        ParkingSlot slot = parkingService.logExit(id);
        return ResponseEntity.ok(convertToResponse(slot));
    }

    // Get Occupied Slots
    @GetMapping("/occupied")
    public ResponseEntity<List<ParkingSlotResponse>> getOccupiedSlots() {
        List<ParkingSlotResponse> response = parkingService.getOccupiedSlots()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Get Daily Log
    @GetMapping("/daily-log/{date}")
    public ResponseEntity<List<ParkingSlotResponse>> getDailyLog(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        List<ParkingSlotResponse> response = parkingService.getDailyLog(localDate)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Helper method to convert entity -> DTO
    private ParkingSlotResponse convertToResponse(ParkingSlot slot) {
        ParkingSlotResponse dto = new ParkingSlotResponse();
        dto.setId(slot.getId());
        dto.setVehicleNumber(slot.getVisitor().getVehicleNumber());
        dto.setFlatNumber(slot.getFlat().getFlatNumber());
        dto.setSlotNumber(slot.getSlotNumber());
        dto.setEntryTime(slot.getEntryTime());
        dto.setExitTime(slot.getExitTime());
        return dto;
    }
}
