package com.nourproject.backend.controllers;

import com.nourproject.backend.dtos.Response;
import com.nourproject.backend.services.KeycloakAdminService;
import com.nourproject.backend.services.UserSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserSyncService userSyncService;
    private final KeycloakAdminService keycloakAdminService;

    /**
     * Manually trigger user synchronization from Keycloak
     *
     * @return ResponseEntity with sync result
     */

    @PostMapping("/sync-users")
    public ResponseEntity<Response> syncUsers() {
        log.info("POST /api/admin/sync-users - Manual user sync triggered");

        try {
            userSyncService.manualSync();

            return ResponseEntity.ok(Response.builder()
                    .status(200)
                    .message("User synchronization completed successfully")
                    .build());
        } catch (Exception e) {
            log.error("Error during manual user sync", e);
            return ResponseEntity.status(500).body(Response.builder()
                    .message("User synchronization failed: " + e.getMessage())
                    .build());
        }
    }


    @GetMapping("/debug-roles/{email}")
    public ResponseEntity<?> debugUserRoles(@PathVariable String email) {
        log.info("GET /api/admin/debug-roles/{} - Checking Keycloak roles", email);

        try {
            UserRepresentation keycloakUser = keycloakAdminService.findUserByEmail(email);

            if (keycloakUser == null) {
                return ResponseEntity.status(404).body(
                    Map.of("error", "User not found in Keycloak", "email", email)
                );
            }

            List<String> roles = keycloakAdminService.getUserRealmRoles(keycloakUser.getId());

            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("keycloakUserId", keycloakUser.getId());
            debugInfo.put("email", keycloakUser.getEmail());
            debugInfo.put("username", keycloakUser.getUsername());
            debugInfo.put("firstName", keycloakUser.getFirstName());
            debugInfo.put("lastName", keycloakUser.getLastName());
            debugInfo.put("realmRoles", roles);
            debugInfo.put("roleCount", roles.size());

            return ResponseEntity.ok(debugInfo);

        } catch (Exception e) {
            log.error("Error checking user roles", e);
            return ResponseEntity.status(500).body(
                Map.of("error", "Failed to check roles: " + e.getMessage())
            );
        }
    }
}
