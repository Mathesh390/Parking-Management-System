package com.sece.parkspot.dto;

import java.time.LocalDateTime;

public class ParkingSlotResponse {
    private Long id;
    private String vehicleNumber;
    private String flatNumber;
    private int slotNumber;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;

    // Getters and setters
    public Long getId() { 
        return id;
     }
    public void setId(Long id) { 
        this.id = id;
     }

    public String getVehicleNumber() { 
        return vehicleNumber;
     }
    public void setVehicleNumber(String vehicleNumber) { 
        this.vehicleNumber = vehicleNumber;
     }

    public String getFlatNumber() { 
        return flatNumber; 
    }
    public void setFlatNumber(String flatNumber) { 
        this.flatNumber = flatNumber;
     }

    public int getSlotNumber() {
         return slotNumber;
         }
    public void setSlotNumber(int slotNumber) { 
        this.slotNumber = slotNumber;
     }

    public LocalDateTime getEntryTime() {
         return entryTime; 
        }
    public void setEntryTime(LocalDateTime entryTime) { 
        this.entryTime = entryTime;
     }

    public LocalDateTime getExitTime() {
         return exitTime;
        }
    public void setExitTime(LocalDateTime exitTime) {
        this.exitTime = exitTime;
     }
}
