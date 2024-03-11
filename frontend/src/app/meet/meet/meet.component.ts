import { Component, OnInit } from '@angular/core';
import { UserOverviewComponent } from '../user-overview/user-overview.component';
import { UsersService } from '../users.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { PersonalInformationService } from '../../account/personal-information.service';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-meet',
  standalone: true,
  imports: [UserOverviewComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './meet.component.html',
  styleUrl: './meet.component.css',
})
export class MeetComponent implements OnInit {
  users: any[] = [];
  filter: string = 'distance';
  filterForm: FormGroup = new FormGroup({});
  options = [
    { label: 'distance', value: 'distance' },
    { label: 'kids', value: 'kids' },
    { label: 'places', value: 'places' },
    { label: 'language', value: 'language' },
  ];
  constructor(
    private usersService: UsersService,
    private cdr: ChangeDetectorRef,
    private accountService: AccountService,
    private personalInformationService: PersonalInformationService
  ) {}
  ngOnInit() {
    this.filterForm = new FormGroup({
      filterSelect: new FormControl('distance'),
    });
    (
      this.filterForm.get('filterSelect') as FormControl
    )?.valueChanges.subscribe((selectedValue: any) => {
      console.log(selectedValue);
      this.filter = selectedValue;
      this.setUsers();
    });
    this.setUsers();
  }
  setUsers() {
    this.usersService.getAllUsers(this.filter).subscribe({
      next: (res) => {
        this.users = res.data.allUsers;
        console.log(res.data.allUsers);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
