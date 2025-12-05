import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../services/toast.service';

@Component({
    selector: 'app-vehicle-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
    templateUrl: './vehicle-form.component.html',
    styleUrl: './vehicle-form.component.css'
})
export class VehicleFormComponent implements OnInit {
    formGroup!: FormGroup;
    editMode = false;
    id?: string;
    isLoading = false;

    vehicleTypes = ['TRUCK', 'VAN', 'COMPACTOR'];
    vehicleStatuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE'];

    // Custom dropdown states
    showTypeDropdown: boolean = false;
    showStatusDropdown: boolean = false;
    selectedTypeName: string = '';
    selectedStatusName: string = '';

    constructor(
        private formBuilder: FormBuilder,
        private matDialogRef: MatDialogRef<VehicleFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.initialise();
    }

    initialise() {
        this.editMode = !!this.data.id;
        if (this.editMode) {
            this.id = this.data.id!;
            if (this.data.type) {
                this.selectedTypeName = this.getVehicleTypeDisplay(this.data.type);
            }
            if (this.data.status) {
                this.selectedStatusName = this.getVehicleStatusDisplay(this.data.status);
            }
        }
        this.formGroup = this.formBuilder.group({
            matricul: [this.data.matricul || '', [Validators.required, Validators.minLength(3)]],
            type: [this.data.type || '', Validators.required],
            capacity: [this.data.capacity || 1000, [Validators.required, Validators.min(1)]],
            status: [this.data.status || 'AVAILABLE', Validators.required],
            currentLocation: [this.data.currentLocation || '']
        });
    }

    onSubmit() {
        if (this.formGroup.valid) {
            const formData = {
                ...this.formGroup.value,
                capacity: Number(this.formGroup.value.capacity)
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

    // Custom dropdown methods
    toggleTypeDropdown() {
        this.showTypeDropdown = !this.showTypeDropdown;
        if (this.showTypeDropdown) this.showStatusDropdown = false;
    }

    toggleStatusDropdown() {
        this.showStatusDropdown = !this.showStatusDropdown;
        if (this.showStatusDropdown) this.showTypeDropdown = false;
    }

    selectType(type: string) {
        this.selectedTypeName = this.getVehicleTypeDisplay(type);
        this.formGroup.patchValue({ type });
        this.showTypeDropdown = false;
    }

    selectStatus(status: string) {
        this.selectedStatusName = this.getVehicleStatusDisplay(status);
        this.formGroup.patchValue({ status });
        this.showStatusDropdown = false;
    }

    getVehicleTypeDisplay(type: string): string {
        const typeMap: { [key: string]: string } = {
            'TRUCK': '🚛 Truck',
            'VAN': '🚐 Van',
            'COMPACTOR': '🗆️ Compactor'
        };
        return typeMap[type] || type;
    }

    getVehicleStatusDisplay(status: string): string {
        const statusMap: { [key: string]: string } = {
            'AVAILABLE': '✅ Available',
            'IN_USE': '🚀 In Use',
            'MAINTENANCE': '🔧 Maintenance',
            'OUT_OF_SERVICE': '⛔ Out of Service'
        };
        return statusMap[status] || status;
    }
}
