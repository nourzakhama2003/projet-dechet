import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../services/toast.service';
import { ContainerService } from '../../../../services/container.service';
import { AppResponse } from '../../../../models/AppResponse';

@Component({
    selector: 'app-pickup-point-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule],
    templateUrl: './pickup-point-form.component.html',
    styleUrl: './pickup-point-form.component.css'
})
export class PickupPointFormComponent implements OnInit {
    formGroup!: FormGroup;
    editMode = false;
    id?: string;
    isLoading = false;
    containers: any[] = [];
    filteredContainers: any[] = [];
    selectedContainers: string[] = [];
    containerSearchTerm: string = '';

    constructor(
        private formBuilder: FormBuilder,
        private matDialogRef: MatDialogRef<PickupPointFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private toastService: ToastService,
        private containerService: ContainerService
    ) { }

    ngOnInit(): void {
        this.initialise();
        this.loadContainers();
    }

    initialise() {
        this.editMode = !!this.data.id;
        if (this.editMode) {
            this.id = this.data.id!;
            this.selectedContainers = this.data.containerIds || [];
        }
        this.formGroup = this.formBuilder.group({
            address: [this.data.address || '', [Validators.required, Validators.minLength(3)]],
            locationLatitude: [this.data.locationLatitude !== undefined ? this.data.locationLatitude : 0, [Validators.required, Validators.min(-90), Validators.max(90)]],
            locationLongitude: [this.data.locationLongitude !== undefined ? this.data.locationLongitude : 0, [Validators.required, Validators.min(-180), Validators.max(180)]],
            description: [this.data.description || '']
        });
    }


    loadContainers() {
        this.isLoading = true;
        this.containerService.getAll().subscribe({
            next: (res: AppResponse) => {
                const allContainers = (res as any).containers || [];

                // Filter containers: show only unassigned OR assigned to current pickup point
                this.containers = allContainers.filter((container: any) => {
                    // If editing, include containers assigned to this pickup point
                    if (this.editMode && container.pickUpPointId === this.id) {
                        return true;
                    }
                    // Include only unassigned containers
                    return !container.pickUpPointId || container.pickUpPointId === '';
                });

                this.filteredContainers = [...this.containers];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching containers', err);
                this.toastService.showError('Error fetching containers');
                this.isLoading = false;
            }
        });
    }

    toggleContainer(containerId: string) {
        const container = this.containers.find(c => c.id === containerId);

        // Check if container is already assigned to another pickup point
        if (container && container.pickUpPointId && container.pickUpPointId !== this.id) {
            this.toastService.showError('This container is already assigned to another pickup point');
            return;
        }

        const index = this.selectedContainers.indexOf(containerId);
        if (index > -1) {
            this.selectedContainers.splice(index, 1);
        } else {
            this.selectedContainers.push(containerId);
        }
    }

    isContainerSelected(containerId: string): boolean {
        return this.selectedContainers.includes(containerId);
    }

    filterContainers() {
        const searchLower = this.containerSearchTerm.toLowerCase().trim();
        if (!searchLower) {
            this.filteredContainers = [...this.containers];
        } else {
            this.filteredContainers = this.containers.filter(container => {
                const type = container.containerType?.toLowerCase() || '';
                const status = container.containerStatus?.toLowerCase() || '';
                const id = container.id?.toLowerCase() || '';
                return type.includes(searchLower) || status.includes(searchLower) || id.includes(searchLower);
            });
        }
    }

    onSubmit() {
        if (this.formGroup.valid) {
            const formData = {
                ...this.formGroup.value,
                locationLatitude: Number(this.formGroup.value.locationLatitude),
                locationLongitude: Number(this.formGroup.value.locationLongitude),
                containerIds: this.selectedContainers
            };
            if (this.editMode) {
                this.matDialogRef.close({ ...formData, id: this.id });
            } else {
                this.matDialogRef.close(formData);
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
