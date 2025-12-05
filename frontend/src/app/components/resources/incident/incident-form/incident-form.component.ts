import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../services/toast.service';
import { PickUpPointService } from '../../../../services/pickup-point.service';
import { UserService } from '../../../../services/user.service';
import { AppResponse } from '../../../../models/AppResponse';

@Component({
    selector: 'app-incident-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
    templateUrl: './incident-form.component.html',
    styleUrl: './incident-form.component.css'
})
export class IncidentFormComponent implements OnInit {
    formGroup!: FormGroup;
    editMode = false;
    id?: string;
    isLoading = false;

    incidentStatuses = ['reported', 'in_progress', 'resolved', 'closed'];
    incidentPriorities = ['low', 'medium', 'high', 'urgent'];
    pickUpPoints: any[] = [];
    users: any[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private matDialogRef: MatDialogRef<IncidentFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private toastService: ToastService,
        private pickUpPointService: PickUpPointService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.initialise();
        this.loadPickUpPoints();
        this.loadUsers();
    }

    initialise() {
        this.editMode = !!this.data.id;
        if (this.editMode) {
            this.id = this.data.id!;
        }
        this.formGroup = this.formBuilder.group({
            description: [this.data.description || '', [Validators.required, Validators.minLength(10)]],
            location: [this.data.location || '', Validators.required],
            status: [this.data.status || 'reported', Validators.required],
            priority: [this.data.priority || 'medium', Validators.required],
            citizenId: [this.data.citizenId || '', Validators.required],
            pickUpPointId: [this.data.pickUpPointId || ''],
            assignedTo: [this.data.assignedTo || ''],
            resolutionNotes: [this.data.resolutionNotes || '']
        });
    }

    loadPickUpPoints() {
        this.isLoading = true;
        this.pickUpPointService.getAll().subscribe({
            next: (res: AppResponse) => {
                this.pickUpPoints = res.pickuppoints || [];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching pickup points', err);
                this.isLoading = false;
            }
        });
    }

    loadUsers() {
        this.userService.getAll().subscribe({
            next: (res: AppResponse) => {
                this.users = (res as any).users || [];
            },
            error: (err) => {
                console.error('Error fetching users', err);
            }
        });
    }

    onSubmit() {
        if (this.formGroup.valid) {
            if (this.editMode) {
                this.matDialogRef.close({ ...this.formGroup.value, id: this.id });
            } else {
                this.matDialogRef.close(this.formGroup.value);
            }
        } else {
            Object.keys(this.formGroup.controls).forEach(key => {
                this.formGroup.get(key)?.markAsTouched();
            });
            this.toastService.showError('Please fill in all required fields correctly');
        }
    }

    onCancel() {
        this.matDialogRef.close();
    }
}
