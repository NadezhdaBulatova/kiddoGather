import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../account/account.service';
import { PersonalInformationService } from '../../account/personal-information.service';
import { MessagingService } from '../../meet/messaging.service';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  @Input() isAccountView = false;
  randomIndex = Math.floor(Math.random() * 6) + 1;
  imagePath = `../../assets/background-imgs/image${this.randomIndex}.png`;
  constructor(
    protected router: Router,
    protected accountService: AccountService,
    protected personalInformationService: PersonalInformationService,
    private messageService: MessagingService
  ) {}

  ngOnInit(): void {
    this.messageService.getMessages(this.accountService.user.id).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
