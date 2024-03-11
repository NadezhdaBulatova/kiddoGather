import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { AccountService } from '../account/account.service';
import { PersonalInformationService } from '../account/personal-information.service';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { LanguageTypes } from '../models/language.type';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { InfoWindowComponent } from '../maps/info-window/info-window.component';
import { Location } from '../models/location.model';
import { KidComponent } from './kid/kid.component';
import { Kid } from '../models/kid.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GoogleMap,
    MapMarker,
    MapInfoWindow,
    InfoWindowComponent,
    KidComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  public markerOptions = {
    icon: {
      url: '../../assets/icons/place.png',
      scaledSize: new google.maps.Size(50, 50),
    },
  };
  public personalMarkerOptions = {
    icon: {
      url: '../../assets/icons/user-location.png',
      scaledSize: new google.maps.Size(50, 50),
    },
  };

  markers: Location[] = this.personalInformationService.locations();
  public overlay = false;
  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }

  closeInfoWindow(marker: MapMarker) {
    this.infoWindow.close();
  }
  markerClicked(event: google.maps.MapMouseEvent) {
    this.overlay = true;
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
  public mapSettings = {
    zoom: 15,
    center: new google.maps.LatLng(
      this.personalInformationService?.location()?.latitude
        ? this.personalInformationService.location().latitude
        : 0,
      this.personalInformationService?.location()?.longitude
        ? this.personalInformationService.location().longitude
        : 0
    ),

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

  recenterMap(place: Location) {
    this.mapSettings.center = new google.maps.LatLng(
      place.latitude || 0,
      place.longitude || 0
    );
  }
  @ViewChild('placeSearch')
  public placeSearchElementRef!: ElementRef;
  @ViewChild(GoogleMap)
  public map!: google.maps.Map;
  public marker!: MapMarker;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  editingName = false;
  editingDate = false;
  editingLanguage = false;
  editingLocation = false;
  overlayFunction = '';
  locationToDelete = {
    id: '',
    name: '',
    address: '',
  };
  languages = Object.values(LanguageTypes);
  editedLocation = {
    character: 'Personal',
    latitude: 0,
    longitude: 0,
    name: '',
    address: '',
  };
  @ViewChild('search')
  public searchElementRef!: ElementRef;
  constructor(
    private accountService: AccountService,
    protected personalInformationService: PersonalInformationService,
    private cdr: ChangeDetectorRef
  ) {}
  form = new FormGroup({});

  onSubmitName() {
    const nameValue = this.form.get('name')?.value;
    if (nameValue) {
      this.personalInformationService
        .changeName(this.accountService.user.id, nameValue)
        .subscribe({
          next: (res) => {
            this.editingName = false;
            this.personalInformationService.name.set(
              res.data.updateUser.userMutationResult.name
            );
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  closeOverlay() {
    this.overlay = false;
    this.cdr.detectChanges();
  }
  onSubmitDate() {
    const dateValue = this.form.get('date')?.value;
    if (dateValue) {
      const convertedDate = new Date(dateValue).toISOString();
      this.personalInformationService
        .changeBirthday(this.accountService.user.id, convertedDate)
        .subscribe({
          next: (res) => {
            this.editingDate = false;
            this.personalInformationService.birthday.set(
              res.data.updateUser.userMutationResult.birthday
            );
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  editDate() {
    this.onCancelLanguage();
    this.onCancelName();
    this.onCancelLocation();
    this.editingDate = true;
    this.form.addControl('date', new FormControl(''));
  }

  editLocation() {
    this.onCancelLanguage();
    this.onCancelName();
    this.onCancelDate();
    this.editingLocation = true;
    this.form.addControl('location', new FormControl(''));
  }

  editLanguage() {
    this.onCancelDate();
    this.onCancelName();
    this.onCancelLocation();
    this.form.addControl('languages', new FormControl(''));
    this.editingLanguage = true;
  }

  editName() {
    this.onCancelDate();
    this.onCancelLanguage();
    this.onCancelLocation();
    this.editingName = true;
    this.form.addControl(
      'name',
      new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
      ])
    );
  }

  ngAfterViewInit(): void {
    if (this.searchElementRef) {
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.editedLocation = {
          character: 'Personal',
          latitude: autocomplete.getPlace().geometry?.location?.lat() || 0,
          longitude: autocomplete.getPlace().geometry?.location?.lng() || 0,
          name: autocomplete.getPlace().name || '',
          address: autocomplete.getPlace().formatted_address || '',
        };
      });
    }

    let autocompletePlace = new google.maps.places.Autocomplete(
      this.placeSearchElementRef.nativeElement
    );
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(
      this.placeSearchElementRef.nativeElement
    );
    // this.marker = new google.maps.Marker({
    //   position: new google.maps.LatLng(...this.testUser.position),
    // });
    autocompletePlace.addListener('place_changed', () => {
      this.overlay = true;
      this.overlayFunction = 'addLocation';

      this.editedLocation = {
        character: 'Place',
        latitude: autocompletePlace.getPlace().geometry?.location?.lat() || 0,
        longitude: autocompletePlace.getPlace().geometry?.location?.lng() || 0,
        name: autocompletePlace.getPlace().name || '',
        address: autocompletePlace.getPlace().formatted_address || '',
      };
      this.cdr.detectChanges();
      this.personalInformationService
        .changeLocation(this.accountService.user.id, this.editedLocation)
        .subscribe({
          next: (res) => {
            this.editingLocation = false;
            this.personalInformationService.location.set(
              res.data.updateUser.userMutationResult.location
            );
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.log(err);
          },
        });
    });
  }

  onSubmitLanguage() {
    const languagesValue: LanguageTypes[] =
      this.form.get('languages')?.value || [];
    if (languagesValue) {
      const languages = languagesValue.map((language: LanguageTypes) => ({
        language: LanguageTypes[language],
      }));
      this.personalInformationService
        .changeLanguage(this.accountService.user.id, languages)
        .subscribe({
          next: (res) => {
            this.editingLanguage = false;
            this.personalInformationService.languages.set(
              res.data.updateUser.userMutationResult.languages
            );
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  deletePlace() {
    if (this.locationToDelete.id) {
      this.personalInformationService
        .deleteFavoriteLocation(
          this.accountService.user.id,
          this.locationToDelete.id
        )
        .subscribe({
          next: (res) => {
            if (res.data.removeLocationFromUser.boolean) {
              this.personalInformationService.locations.set(
                this.personalInformationService
                  .locations()
                  .filter((location) => {
                    return location.locationId !== this.locationToDelete.id;
                  })
              );
              this.markers = this.personalInformationService.locations();
              this.overlay = false;
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }
  addKid() {
    const kid: Kid = {
      name: this.form.get('name')?.value || '',
      birthday: this.form.get('birthday')?.value || '',
      gender: this.form.get('gender')?.value || '',
    };
    console.log(this.form.value);
    this.personalInformationService
      .addKid(this.accountService.user.id, [kid])
      .subscribe({
        next: (res) => {
          this.overlay = false;
          this.overlayFunction = '';
          if (res.data.updateUser.userMutationResult?.kids)
            this.personalInformationService.kids.set(
              res.data.updateUser.userMutationResult?.kids
            );
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  openKidAddOverlay() {
    this.overlay = true;
    this.overlayFunction = 'addKid';
    this.form.addControl('name', new FormControl(''));
    this.form.addControl('gender', new FormControl('MALE'));
    this.form.addControl('birthday', new FormControl(''));
    this.cdr.detectChanges();
  }
  onCancelAddKid() {
    this.overlay = false;
    this.overlayFunction = '';
    this.form.removeControl('kidName');
    this.form.removeControl('kidGender');
    this.form.removeControl('kidBirthday');
    this.cdr.detectChanges();
  }

  confirmDeletePlace(location: any) {
    this.overlay = true;
    this.overlayFunction = 'deletePlace';
    this.locationToDelete = location;
  }

  addLocation() {
    this.personalInformationService
      .addFavoriteLocations(this.accountService.user.id, [this.editedLocation])
      .subscribe({
        next: (res) => {
          console.log(res);
          this.personalInformationService.locations.set(
            res.data.updateUser.userMutationResult.locations.filter(
              (location: { character: string }) =>
                location.character !== 'Personal'
            )
          );
          this.markers = this.personalInformationService.locations();
          this.overlay = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  onSubmitLocation() {
    this.personalInformationService
      .changeLocation(this.accountService.user.id, this.editedLocation)
      .subscribe({
        next: (res) => {
          this.editingLocation = false;
          this.personalInformationService.location.set(
            res.data.updateUser.userMutationResult.location
          );
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  onCancelLanguage() {
    this.editingLanguage = false;
    this.form.removeControl('languages');
  }

  onCancelName() {
    this.editingName = false;
    this.form.removeControl('name');
  }
  onCancelDate() {
    this.editingDate = false;
    this.form.removeControl('date');
  }
  onCancelLocation() {
    this.editingLocation = false;
    this.form.removeControl('location');
  }

  logout() {
    this.accountService.logout();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.personalInformationService
      .uploadFile(file, this.accountService.user.id)
      .subscribe({
        next: (response: any) => {
          this.personalInformationService.profilePictureURL.set(
            `${environment.graphQLApiUrl}/${response.data.uploadUserPicture.string}`
          );
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(error);
        },
      });
  }
}
