package com.nourproject.backend.entities;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "routes")
public class Route {
    @Id
    private String _id;
    @Builder.Default
    List<PickUpPoint> pickUpPoints=new ArrayList<PickUpPoint>();
    private Vehicule vehicule;
    @Builder.Default
    List<User> users=new ArrayList<>();


    private LocalDateTime RouteDate;



}
