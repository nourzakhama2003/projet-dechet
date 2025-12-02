package com.nourproject.backend.repositories;

import com.nourproject.backend.entities.User;
import com.nourproject.backend.enums.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends MongoRepository<User, String> {


    Optional<User> findByUserName(String userName);


    Optional<User> findByEmail(String email);

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);

    List<User> findByRole(UserRole role);


    List<User> findByIsActive(Boolean isActive);


    List<User> findByFaceAuthEnabled(Boolean faceAuthEnabled);


    @Query("{ $or: [ { 'first_name': { $regex: ?0, $options: 'i' } }, { 'last_name': { $regex: ?1, $options: 'i' } } ] }")
    List<User> findByFirstNameOrLastName(String firstName, String lastName);

    void deleteByUserName(String userName);


    void deleteByEmail(String email);
}
