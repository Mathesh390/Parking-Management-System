package com.sece.parkspot.service;

import com.sece.parkspot.entity.Flat;
import com.sece.parkspot.entity.Visitor;
import com.sece.parkspot.entity.ParkingSlot;
import com.sece.parkspot.exception.ProjectNotFoundException;
import com.sece.parkspot.repository.FlatRepository;
import com.sece.parkspot.repository.VisitorRepository;
import com.sece.parkspot.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ParkingService {

    @Autowired
    private VisitorRepository visitorRepo;

    @Autowired
    private FlatRepository flatRepo;

    @Autowired
    private ParkingSlotRepository slotRepo;

    // Log entry
    public ParkingSlot logEntry(String vehicleNumber, String flatNumber, int slotNumber) {
        // Check if slot is already occupied
        if (slotRepo.existsBySlotNumberAndExitTimeIsNull(slotNumber)) {
            throw new ProjectNotFoundException("Slot " + slotNumber + " is already occupied!");
        }

        // Find or create Visitor
        Visitor visitor = visitorRepo.findByVehicleNumber(vehicleNumber)
                .orElseGet(() -> {
                    Visitor newVisitor = new Visitor();
                    newVisitor.setVehicleNumber(vehicleNumber);
                    return visitorRepo.save(newVisitor);
                });

        // Find or create Flat
        Flat flat = flatRepo.findByFlatNumber(flatNumber)
                .orElseGet(() -> {
                    Flat newFlat = new Flat();
                    newFlat.setFlatNumber(flatNumber);
                    return flatRepo.save(newFlat);
                });

        // Create ParkingSlot record
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(slotNumber);
        slot.setEntryTime(LocalDateTime.now());
        slot.setVisitor(visitor);
        slot.setFlat(flat);

        return slotRepo.save(slot);
    }

    // Log exit
    public ParkingSlot logExit(Long id) {
        ParkingSlot slot = slotRepo.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Parking record not found with id: " + id));
        slot.setExitTime(LocalDateTime.now());
        return slotRepo.save(slot);
    }

    // Get occupied slots
    public List<ParkingSlot> getOccupiedSlots() {
        return slotRepo.findByExitTimeIsNull();
    }

    // Get daily log
    public List<ParkingSlot> getDailyLog(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        return slotRepo.findByEntryTimeBetween(start, end);
    }
}
