import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-route-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './route-card.component.html',
  styleUrl: './route-card.component.css'
})
export class RouteCardComponent {
  @Input() route: any;
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  edit() {
    this.onEdit.emit(this.route);
  }

  delete() {
    this.onDelete.emit(this.route);
  }
}
