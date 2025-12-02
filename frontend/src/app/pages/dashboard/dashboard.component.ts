import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/UserProfile';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  users: UserProfile[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.userService.getAll().subscribe({
      next: (response) => {
        if (response.status === 200 && response.users) {
          this.users = response.users;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = error?.status === 403
          ? 'Access denied. Admin role required.'
          : 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });
  }

  get activeUsersCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'badge-admin' : 'badge-user';
  }
}
