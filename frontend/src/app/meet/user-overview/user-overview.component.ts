import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { OverlayModule, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { MessagingService } from '../messaging.service';
import { Router } from '@angular/router';
import { PersonalInformationService } from '../../account/personal-information.service';
import { KidComponent } from '../../settings/kid/kid.component';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { Location } from '../../models/location.model';
import { AccountService } from '../../account/account.service';

@Component({
  selector: 'app-user-overview',
  standalone: true,
  imports: [
    OverlayModule,
    PortalModule,
    KidComponent,
    CommonModule,
    GoogleMap,
    MapMarker,
  ],
  templateUrl: './user-overview.component.html',
  styleUrl: './user-overview.component.css',
  host: { '(click)': 'onClick()' },
})
export class UserOverviewComponent implements OnInit {
  @Input() user: any;
  @ViewChild(CdkPortal) portal!: CdkPortal;
  overlayRef: OverlayRef | null = null;
  markers: Location[] = [];
  public mapSettings = {
    zoom: 15,
    center: new google.maps.LatLng(0, 0),

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
  @ViewChild(GoogleMap)
  public map!: google.maps.Map;
  public marker!: MapMarker;

  constructor(
    private overlayUser: Overlay,
    private messagingService: MessagingService,
    private router: Router,
    private accountService: AccountService,
    private profileInformationService: PersonalInformationService
  ) {}

  ngOnInit() {
    console.log(this.user);
    this.markers = this.user.locations;
    this.mapSettings.center = new google.maps.LatLng(
      this.user.location?.latitude ? this.user.location.latitude : 0,
      this.user.location?.longitude ? this.user.location.longitude : 0
    );
  }
  recenterMap(place: Location) {
    this.mapSettings.center = new google.maps.LatLng(
      place.latitude || 0,
      place.longitude || 0
    );
  }
  public markerOptions = {
    icon: {
      url: '../../assets/icons/place.png',
      scaledSize: new google.maps.Size(50, 50),
    },
  };
  onClick() {
    this.openOverlay();
  }
  onZoomChange() {
    const zoom = this.map.getZoom();
    const size = zoom ? zoom * 2.5 : 50;

    this.markerOptions = {
      ...this.markerOptions,
      icon: {
        url: '../../assets/icons/place.png',
        scaledSize: new google.maps.Size(size, size),
      },
    };
  }
  startChat() {
    this.messagingService
      .createChat(this.accountService.user.id, this.user.id)
      .subscribe({
        next: (res) => {
          const chatId = res.data.addChat.chatMutationResult.id;
          this.router.navigate(['/chat/', chatId]);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  openOverlay() {
    this.overlayRef = this.overlayUser.create({
      hasBackdrop: true,
      positionStrategy: this.overlayUser
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });
    this.overlayRef.attach(this.portal);

    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef?.detach();
    });
  }

  get birthday(): any {
    if (this.user.birthday) {
      const date = new Date(this.user.birthday).toLocaleDateString();
      if (date === 'Invalid Date') {
        return 'Birthday not set';
      }
      return date;
    }
    return 'Birthday not set';
  }

  get languages(): any {
    if (this.user.languages.length === 0) {
      return 'Languages not set';
    } else
      return this.user.languages
        .map(
          (language: { language: string }) =>
            language.language.toLowerCase().charAt(0).toUpperCase() +
            language.language.slice(1).toLowerCase()
        )
        .join(', ');
  }
}
