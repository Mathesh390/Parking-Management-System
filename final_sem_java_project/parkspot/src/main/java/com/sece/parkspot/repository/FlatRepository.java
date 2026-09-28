package com.sece.parkspot.repository;

import com.sece.parkspot.entity.Flat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FlatRepository extends JpaRepository<Flat, Long> {
    Optional<Flat> findByFlatNumber(String flatNumber);
}
