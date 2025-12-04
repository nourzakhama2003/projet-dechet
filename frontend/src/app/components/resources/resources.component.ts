import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { ContainerService } from '../../services/container.service';
import { PickUpPointService } from '../../services/pickup-point.service';
import { VehiculeService } from '../../services/vehicule.service';
import { IncidentService } from '../../services/incident.service';
import { NotificationService } from '../../services/notification.service';
import { RouteService } from '../../services/route.service';
import { MapComponent } from '../map/map.component';
import { ProfileComponent } from '../profile/profile.component';
import { AppResponse } from '../../models/AppResponse';
import { ToastService } from '../../services/toast.service';
import { UserProfile } from '../../models/UserProfile';
import { UsersListComponent } from './user/users-list/users-list.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ContainersListComponent } from './container/containers-list/containers-list.component';
import { PickupPointsListComponent } from './pickup-point/pickup-points-list/pickup-points-list.component';
import { VehiclesListComponent } from './vehicle/vehicles-list/vehicles-list.component';
import { IncidentsListComponent } from './incident/incidents-list/incidents-list.component';
import { NotificationsListComponent } from './notification/notifications-list/notifications-list.component';
import { RoutesListComponent } from './route/routes-list/routes-list.component';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [
    CommonModule,
    MapComponent,
    MatDialogModule,
    UsersListComponent,
    ContainersListComponent,
    PickupPointsListComponent,
    VehiclesListComponent,
    IncidentsListComponent,
    NotificationsListComponent,
    RoutesListComponent
  ],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css',
})
export class ResourcesComponent implements OnInit {
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  activeTab: 'users' | 'containers' | 'pickuppoints' | 'vehicles' | 'incidents' | 'notifications' | 'routes' = 'users';
  sidebarOpen: boolean = true;
  users: any[] = [];
  containers: any[] = [];
  pickupPoints: any[] = [];
  vehicles: any[] = [];
  incidents: any[] = [];
  notifications: any[] = [];
  routes: any[] = [];

  loading: boolean = false;
  showMap: boolean = false; // Closed by default

  constructor(
    private userService: UserService,
    private containerService: ContainerService,
    private pickupPointService: PickUpPointService,
    private vehiculeService: VehiculeService,
    private incidentService: IncidentService,
    private notificationService: NotificationService,
    private routeService: RouteService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  setActiveTab(tab: 'users' | 'containers' | 'pickuppoints' | 'vehicles' | 'incidents' | 'notifications' | 'routes') {
    this.activeTab = tab;
    if (tab === 'users' && this.users.length === 0) {
      this.loadUsers();
    } else if (tab === 'containers' && this.containers.length === 0) {
      this.loadContainers();
    } else if (tab === 'pickuppoints' && this.pickupPoints.length === 0) {
      this.loadPickupPoints();
    } else if (tab === 'vehicles' && this.vehicles.length === 0) {
      this.loadVehicles();
    } else if (tab === 'incidents' && this.incidents.length === 0) {
      this.loadIncidents();
    } else if (tab === 'notifications' && this.notifications.length === 0) {
      this.loadNotifications();
    } else if (tab === 'routes' && this.routes.length === 0) {
      this.loadRoutes();
    }
  }

  toggleMap() {
    this.showMap = !this.showMap;
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (res: AppResponse) => {
        this.users = (res as any).users || [];

        this.loading = false;
      },
      error: (err: any) => {
        this.toastService.showError(`${err.error.message}`);
        this.loading = false;
      }
    });
  }

  addUser() {
    const dialogRef = this.dialog.open(ProfileComponent, {
      width: '60%',
      height: '90%',
      data: {} // Empty data for new user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.userService.createOrUpdateUser(result).subscribe({
          next: (res: AppResponse) => {
            this.toastService.showSuccess('User created successfully');
            this.users = [...this.users, res.user];
          },
          error: (err: any) => {
            this.toastService.showError(err.error?.message || 'Failed to create user');
            this.loading = false;
          }
        });
      }
    });
  }

  editUser(user: UserProfile) {
    const dialogRef = this.dialog.open(ProfileComponent, {
      width: '60%',
      height: '90%',
      data: { ...user } // Pass copy of user data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        // If the backend supports updating by ID, use that.
        // Assuming result contains the updated fields.
        // We need to make sure we pass the ID if needed, but ProfileComponent might not return it if it's not in the form.
        // However, we have 'user.id' from the argument.

        this.userService.updateUserById(user.id!, result).subscribe({
          next: (res: AppResponse) => {
            this.toastService.showSuccess('User updated successfully');
            if (res.user) {
              this.users = this.users.map(u => u.id === user.id ? res.user : u);
            }
            this.loading = false;
          },
          error: (err: any) => {
            this.toastService.showError(err.error?.message || 'Failed to update user');
            this.loading = false;
          }
        });
      }
    });
  }

  deleteUser(user: UserProfile) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Confirm Deletion', message: `Are you sure you want to delete user ${user.userName}?` }
    })
    ref.afterClosed().subscribe(
      {
        next: (res) => {
          if (res) {
            this.loading = true;
            this.userService.deleteUserById(user.id!).subscribe({
              next: (res: AppResponse) => {
                this.toastService.showSuccess('User deleted successfully');
                this.users = this.users.filter(u => u.id !== user.id);
              },
              error: (err: any) => {
                this.toastService.showError(err.error?.message || 'Failed to delete user');
                this.loading = false;
              }
            });
          }
        }
        ,

        error: (err) => {
          this.toastService.showError('Deletion cancelled');
        }
      }
    )


  }

  loadContainers() {
    this.loading = true;
    this.containerService.getAll().subscribe({
      next: (res: AppResponse) => {
        this.containers = (res as any).containers || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.toastService.showError(`${err.error?.message || 'Failed to load containers'}`);
        this.loading = false;
      }
    });
  }

  editContainer(container: any) {
    console.log('Edit container', container);
    // TODO: Implement edit container dialog
  }

  deleteContainer(container: any) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Confirm Deletion', message: `Are you sure you want to delete container #${container.id?.substring(0, 8)}?` }
    });
    ref.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.loading = true;
          this.containerService.delete(container.id).subscribe({
            next: (res: AppResponse) => {
              this.toastService.showSuccess('Container deleted successfully');
              this.containers = this.containers.filter(c => c.id !== container.id);
              this.loading = false;
            },
            error: (err: any) => {
              this.toastService.showError(err.error?.message || 'Failed to delete container');
              this.loading = false;
            }
          });
        }
      }
    });
  }

  loadPickupPoints() {
    this.loading = true;
    this.pickupPointService.getAll().subscribe({
      next: (res: AppResponse) => {
        this.pickupPoints = (res as any).pickuppoints || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.toastService.showError(`${err.error?.message || 'Failed to load pickup points'}`);
        this.loading = false;
      }
    });
  }

  loadVehicles() {
    this.loading = true;
    this.vehiculeService.getAll().subscribe({
      next: (res: AppResponse) => {
        this.vehicles = (res as any).vehicules || [];
        console.log('Vehicles loaded:', this.vehicles);
        this.loading = false;
      },
      error: (err: any) => {
        this.toastService.showError(`${err.error?.message || 'Failed to load vehicles'}`);
        this.loading = false;
      }
    });
  }

  loadIncidents() {
    this.loading = true;
    this.incidentService.getAll().subscribe({
      next: (res: AppResponse) => {
        this.incidents = (res as any).incidents || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.toastService.showError(`${err.error?.message || 'Failed to load incidents'}`);
        this.loading = false;
      }
    });
  }

  loadNotifications() {
    this.loading = true;
    this.notificationService.getAll().subscribe({
      next: (res: AppResponse) => {
        this.notifications = (res as any).notifications || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.toastService.showError(`${err.error?.message || 'Failed to load notifications'}`);
        this.loading = false;
      }
    });
  }

  loadRoutes() {
    this.loading = true;
    this.routeService.getAll().subscribe({
      next: (res: AppResponse) => {
        this.routes = (res as any).routes || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.toastService.showError(`${err.error?.message || 'Failed to load routes'}`);
        this.loading = false;
      }
    });
  }

  deletePickupPoint(point: any) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Confirm Deletion', message: `Are you sure you want to delete pickup point #${point.id?.substring(0, 6)}?` }
    });
    ref.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.loading = true;
          this.pickupPointService.delete(point.id).subscribe({
            next: (res: AppResponse) => {
              this.toastService.showSuccess('Pickup point deleted successfully');
              this.pickupPoints = this.pickupPoints.filter(p => p.id !== point.id);
              this.loading = false;
            },
            error: (err: any) => {
              this.toastService.showError(err.error?.message || 'Failed to delete pickup point');
              this.loading = false;
            }
          });
        }
      }
    });
  }

  editPickupPoint(point: any) {
    console.log('Edit pickup point', point);
  }

  deleteVehicle(vehicle: any) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Confirm Deletion', message: `Are you sure you want to delete vehicle ${vehicle.matricul}?` }
    });
    ref.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.loading = true;
          this.vehiculeService.delete(vehicle.id).subscribe({
            next: (res: AppResponse) => {
              this.toastService.showSuccess('Vehicle deleted successfully');
              this.vehicles = this.vehicles.filter(v => v.id !== vehicle.id);
              this.loading = false;
            },
            error: (err: any) => {
              this.toastService.showError(err.error?.message || 'Failed to delete vehicle');
              this.loading = false;
            }
          });
        }
      }
    });
  }

  editVehicle(vehicle: any) {
    console.log('Edit vehicle', vehicle);
  }

  resolveIncident(incident: any) {
    this.loading = true;
    this.incidentService.update(incident.id, { status: 'resolved' } as any).subscribe({
      next: (res: AppResponse) => {
        this.toastService.showSuccess('Incident resolved successfully');
        this.incidents = this.incidents.map(i => i.id === incident.id ? { ...i, status: 'resolved' } : i);
        this.loading = false;
      },
      error: (err: any) => {
        this.toastService.showError(err.error?.message || 'Failed to resolve incident');
        this.loading = false;
      }
    });
  }

  viewIncident(incident: any) {
    console.log('View incident', incident);
  }

  deleteNotification(notification: any) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Confirm Deletion', message: `Are you sure you want to delete this notification?` }
    });
    ref.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.loading = true;
          this.notificationService.delete(notification.id).subscribe({
            next: (res: AppResponse) => {
              this.toastService.showSuccess('Notification deleted successfully');
              this.notifications = this.notifications.filter(n => n.id !== notification.id);
              this.loading = false;
            },
            error: (err: any) => {
              this.toastService.showError(err.error?.message || 'Failed to delete notification');
              this.loading = false;
            }
          });
        }
      }
    });
  }

  viewNotification(notification: any) {
    console.log('View notification', notification);
  }

  deleteRoute(route: any) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Confirm Deletion', message: `Are you sure you want to delete route #${route.id?.substring(0, 8)}?` }
    });
    ref.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.loading = true;
          this.routeService.delete(route.id).subscribe({
            next: (res: AppResponse) => {
              this.toastService.showSuccess('Route deleted successfully');
              this.routes = this.routes.filter(r => r.id !== route.id);
              this.loading = false;
            },
            error: (err: any) => {
              this.toastService.showError(err.error?.message || 'Failed to delete route');
              this.loading = false;
            }
          });
        }
      }
    });
  }

  viewRoute(route: any) {
    console.log('View route', route);
  }

  // Create route from optimized map data
  createRouteFromMap() {
    if (this.mapComponent && this.mapComponent.hasOptimizedRoute()) {
      this.mapComponent.saveOptimizedRoute();
      // Reload routes after a short delay to show the new route
      setTimeout(() => this.loadRoutes(), 1000);
    } else {
      this.toastService.showError('Please optimize a route first on the map');
    }
  }

  // Check if map has optimized route ready
  hasOptimizedRoute(): boolean {
    return this.mapComponent?.hasOptimizedRoute() || false;
  }
  show() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
