package com.nourproject.backend.entities;

import com.nourproject.backend.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private String _id;
    private String subject;
    private String recipient;
    private String body;
    private NotificationType notificationType;
    private Incident incident;
    private Container container;

}
