package com.nourproject.backend.dtos.vehicule;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.nourproject.backend.entities.User;
import com.nourproject.backend.enums.VehiculeStatus;
import com.nourproject.backend.enums.VehiculeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// import com.nourproject.backend.enums.UserRole; // Unused
// import jakarta.validation.constraints.Email; // Unused
// import jakarta.validation.constraints.NotBlank; // Unused
// import java.time.LocalDateTime; // Unused
// import java.util.ArrayList; // Unused
import java.util.List;


@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class VehiculeDto {


    private String id;

    private String matricul;
    private double capacity;
    private VehiculeStatus vehiculeStatus;
    private VehiculeType vehiculeType;
    List<User> users;




}
