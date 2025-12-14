import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { links } from '../../../models/constants';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppKeycloakService } from '../../../keycloak/appKeycloakService';
import { UserRole } from '../../../models/enums/UserRole';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {
  constructor(private appkeycloakSerice: AppKeycloakService) { }
  links = links;
  admin = false;
  isEmploye = false;
  profileSubscription!: Subscription

  ngOnInit(): void {
    this.profileSubscription = this.appkeycloakSerice.profileObservable.subscribe(profile => {
      this.admin = profile?.role && profile?.role == UserRole.admin ? true : false;
      this.isEmploye = profile?.role && profile?.role == UserRole.employe ? true : false;
    })
  }

  ngOnDestroy(): void {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

}
