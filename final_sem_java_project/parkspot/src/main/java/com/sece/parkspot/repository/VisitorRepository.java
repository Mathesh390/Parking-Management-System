package com.sece.parkspot.repository;

import com.sece.parkspot.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;

import java.util.Optional;

//@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    Optional<Visitor> findByVehicleNumber(String vehicleNumber);
}
