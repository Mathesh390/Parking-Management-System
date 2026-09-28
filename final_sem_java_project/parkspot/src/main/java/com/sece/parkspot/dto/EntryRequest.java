package com.sece.parkspot.dto;

public class EntryRequest {
    private String vehicleNumber;
    private String flatVisited;
    private int slotNumber;

    // Getters and setters
    public String getVehicleNumber() {
        return vehicleNumber;
    }
    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getFlatVisited() {
        return flatVisited;
    }
    public void setFlatVisited(String flatVisited) {
        this.flatVisited = flatVisited;
    }

    public int getSlotNumber() {
        return slotNumber;
    }
    public void setSlotNumber(int slotNumber) {
        this.slotNumber = slotNumber;
    }
}
