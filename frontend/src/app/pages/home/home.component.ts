import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from '@angular/common';
import { AppKeycloakService } from "../../keycloak/appKeycloakService";
import { Subscription } from 'rxjs';
import { UserRole } from "../../models/enums/UserRole";

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
    admin = false;
    private profileSubscription?: Subscription;

    constructor(private AppkeyCloakService: AppKeycloakService) { }

    ngOnInit(): void {
        this.profileSubscription = this.AppkeyCloakService.profileObservable.subscribe(profile => {
            this.admin = profile && profile.role === UserRole.Admin ? true : false;
        });
    }

    ngOnDestroy(): void {
        if (this.profileSubscription) {
            this.profileSubscription.unsubscribe();
        }
    }

    get isAdmin(): boolean {
        const currentProfile = this.AppkeyCloakService.profile;
        return currentProfile && currentProfile.role === UserRole.Admin ? true : false;
    }
}