import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { User } from '../../models/user.model';
import { InfoWindowComponent } from '../info-window/info-window.component';
import { MapsServiceService } from '../maps-service.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    GoogleMap,
    MapMarker,
    MapInfoWindow,
    InfoWindowComponent,
    CommonModule,
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent implements OnInit {
  testUser: User = {
    id: '1',
    username: 'test',
    jwt: 'test',
    position: [52.377956, 4.89707],
    places: [
      {
        coordinates: [52.3336589, 4.9514957],
      },
    ],
  };
  public markerOptions = {
    icon: {
      url: '../../../assets/icons/place.png',
      scaledSize: new google.maps.Size(50, 50),
    },
  };

  selectedLocation = { name: '', address: '', users: [] };

  constructor(protected mapService: MapsServiceService) {}

  @ViewChild('search')
  public searchElementRef!: ElementRef;
  @ViewChild(GoogleMap)
  public map!: google.maps.Map;
  public marker!: MapMarker;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  public position = {
    lat: 52.3336589,
    lng: 4.9514957,
  };

  public overlay = false;

  openInfoWindow(marker: MapMarker, location: any) {
    this.selectedLocation = location;
    this.infoWindow.open(marker);
  }

  closeInfoWindow(marker: MapMarker) {
    this.infoWindow.close();
  }

  onZoomChange() {
    const zoom = this.map.getZoom();
    const size = zoom ? zoom * 2.5 : 50;

    this.markerOptions = {
      ...this.markerOptions,
      icon: {
        url: '../../../assets/icons/place.png',
        scaledSize: new google.maps.Size(size, size),
      },
    };
  }

  markerClicked(event: google.maps.MapMouseEvent) {
    // this.overlay = true;
  }

  ngOnInit() {
    this.mapService.getAllLocations().subscribe({
      next: (res) => {
        this.mapService.locations.set(
          res.data.allLocations.filter(
            (location: { character: string }) => location.character === 'Place'
          )
        );
        console.log(this.mapService.locations());
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  public mapSettings = {
    zoom: 15,
    center: new google.maps.LatLng(...this.testUser.position),

    options: {
      zoomControl: true,
      scrollwheel: false,
      disableDefaultUI: true,
      fullscreenControl: true,
      disableDoubleClickZoom: true,
      mapTypeControl: false,
    },
    styles: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }],
      },
    ],
  };

  markerPositions: google.maps.LatLngLiteral[] = [this.position];

  ngAfterViewInit(): void {
    let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement
    );
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(
      this.searchElementRef.nativeElement
    );
    // this.marker = new google.maps.Marker({
    //   position: new google.maps.LatLng(...this.testUser.position),
    // });
    autocomplete.addListener('place_changed', () => {
      let place: google.maps.places.PlaceResult = autocomplete.getPlace();
      if (place.geometry === undefined || place.geometry === null) {
        return;
      }
      if (place.geometry.viewport) {
        // console.log(
        //   'viewport',
        //   place.geometry.location?.lat(),
        //   place.geometry.location?.lng()
        // );
        this.map.fitBounds(place.geometry.viewport);
      } else {
        this.mapSettings.center = place.geometry.location
          ? new google.maps.LatLng(place.geometry.location)
          : this.mapSettings.center;
        this.mapSettings.zoom = 17;
      }
    });
  }
}
