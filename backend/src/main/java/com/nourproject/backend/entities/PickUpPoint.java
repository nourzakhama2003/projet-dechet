package com.nourproject.backend.entities;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "collectpoints")
public class PickUpPoint {
    @Id
    private String _id;
    @Builder.Default
    List<Container> containers=new ArrayList<Container>();
    private String location;


}
