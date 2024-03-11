import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css',
})
export class ChatBoxComponent {
  @Input() active: boolean = false;
  @Input() date: Date = new Date();
  @Input() text: string = '';
  @Input() image: string = '';
  @Input() userImage: string = '';
  @HostBinding('style.flex-direction') direction!: string;
  @HostBinding('style.justify-content') align!: string;

  constructor() {}

  ngOnInit() {
    this.direction = this.active ? 'row-reverse' : 'row';
    this.align = this.active ? 'start' : 'end';
  }

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
}
