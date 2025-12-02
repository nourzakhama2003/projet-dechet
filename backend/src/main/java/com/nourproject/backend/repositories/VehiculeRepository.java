package com.nourproject.backend.repositories;

import com.nourproject.backend.entities.User;
import com.nourproject.backend.entities.Vehicule;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VehiculeRepository  extends MongoRepository<Vehicule, String> {
}
