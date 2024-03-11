import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-window',
  standalone: true,
  imports: [],
  templateUrl: './info-window.component.html',
  styleUrl: './info-window.component.css',
})
export class InfoWindowComponent {
  @Input() location = {
    name: '',
    address: '',
    users: [],
  };
}
