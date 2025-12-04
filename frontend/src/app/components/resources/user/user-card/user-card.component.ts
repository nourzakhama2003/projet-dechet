import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-user-card',
  imports: [],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
@Input() user:any;
@Output() onEditUser = new EventEmitter<any>();
@Output() onDeleteUser = new EventEmitter<any>();


editUser(user: any) {
  this.onEditUser.emit(this.user);  
}
deleteUser(user: any) {
  this.onDeleteUser.emit(this.user);
}


}
