package com.sece.parkspot.repository;

import com.sece.parkspot.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

//@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    boolean existsBySlotNumberAndExitTimeIsNull(int slotNumber);
    List<ParkingSlot> findByExitTimeIsNull();
    List<ParkingSlot> findByEntryTimeBetween(LocalDateTime start, LocalDateTime end);
}
