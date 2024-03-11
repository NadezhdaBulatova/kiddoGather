import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Router, RouterModule } from '@angular/router';
import { MapsServiceService } from '../maps-service.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMap, RouterModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent {
  constructor(protected mapsService: MapsServiceService) {}
}
