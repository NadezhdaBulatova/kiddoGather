import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessagingService } from '../../meet/messaging.service';

@Component({
  selector: 'app-chat-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-overview.component.html',
  styleUrl: './chat-overview.component.css',
  host: { '(click)': 'onClick()' },
})
export class ChatOverviewComponent {
  @Input() name: string = '';
  @Input() image: string = '';
  @Input() text: string = '';
  @Input() date: Date = new Date();
  @Input() lastMessageFromUser = false;
  @Input() chatId = '';
  constructor(
    private router: Router,
    private messageService: MessagingService
  ) {}

  get dateDisplay(): string {
    const differenceInTime = new Date().getTime() - this.date.getTime();
    if (differenceInTime < 60 * 60 * 1000) {
      return `${Math.floor(differenceInTime / (60 * 1000))} minutes ago`;
    } else if (differenceInTime < 24 * 60 * 60 * 1000) {
      return `${Math.floor(differenceInTime / (60 * 60 * 1000))} hours ago`;
    } else if (differenceInTime < 7 * 24 * 60 * 60 * 1000) {
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      return `on ${days[this.date.getDay()]}`;
    } else {
      return `${Math.floor(differenceInTime / (24 * 60 * 60 * 1000))} days ago`;
    }
  }

  onClick() {
    this.messageService.getAllMessages(this.chatId).subscribe({
      next: (res) => {
        this.router.navigate(['/chat', this.chatId]);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
