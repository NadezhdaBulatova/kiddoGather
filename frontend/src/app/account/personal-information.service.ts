import { Injectable, signal, computed } from '@angular/core';
import { Apollo, MutationResult } from 'apollo-angular';
import {
  INIT_USER,
  FIND_USER,
  CHANGE_NAME,
  CHANGE_BIRTHDAY,
  CHANGE_LANGUAGE,
  CHANGE_LOCATION,
  ADD_FAVORITE_LOCATION,
  DELETE_FAVORITE_LOCATION,
  DELETE_KID,
  ADD_KID,
} from '../graphql.operations';
import { Observable } from 'rxjs';
import { ApolloQueryResult } from '@apollo/client';
import { HttpClient } from '@angular/common/http';
import { Location } from '../models/location.model';
import { Kid } from '../models/kid.model';
import { LanguageTypes } from '../models/language.type';

@Injectable({
  providedIn: 'root',
})
export class PersonalInformationService {
  name = signal<string>('');
  profilePictureURL = signal<string>('../../assets/icons/user.png');
  birthday = signal<string>('');
  languages = signal<{ language: string }[]>([]);
  locations = signal<Location[]>([]);
  kids = signal<Kid[]>([]);
  location = signal<{
    latitude: number;
    longitude: number;
    name: string;
    character: string;
    address: string;
  }>({
    latitude: 0,
    longitude: 0,
    name: '',
    character: '',
    address: '',
  });
  derivedBirthday = computed(() => {
    const date = new Date(this.birthday()).toLocaleDateString();
    if (date === 'Invalid Date') {
      return 'Birthday not set';
    }
    return date;
  });
  derivedLanguages = computed(() => {
    console.log(this.languages());
    if (this.languages().length === 0) {
      return 'Languages not set';
    } else
      return this.languages()
        .map(
          (language) =>
            language.language.toLowerCase().charAt(0).toUpperCase() +
            language.language.slice(1).toLowerCase()
        )
        .join(', ');
  });

  constructor(private apollo: Apollo, private http: HttpClient) {}

  initialSetup(id: string, name: string): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: INIT_USER,
      variables: {
        id: id,
        name: name,
      },
    });
  }

  findUser(id: string): Observable<ApolloQueryResult<any>> {
    return this.apollo.query({
      query: FIND_USER,
      variables: {
        id: id,
      },
    });
  }

  addFavoriteLocations(
    id: string,
    locations: Location[]
  ): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: ADD_FAVORITE_LOCATION,
      variables: {
        id,
        locations,
      },
    });
  }

  deleteFavoriteLocation(
    userId: string,
    locationId: string | undefined
  ): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: DELETE_FAVORITE_LOCATION,
      variables: {
        userId,
        locationId,
      },
    });
  }

  deleteKid(id: string): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: DELETE_KID,
      variables: {
        id,
      },
    });
  }

  addKid(id: string, kids: Kid[]): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: ADD_KID,
      variables: {
        id,
        kids,
      },
    });
  }

  changeName(id: string, name: string): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: CHANGE_NAME,
      variables: {
        id: id,
        name: name,
      },
    });
  }

  changeBirthday(id: string, birthday: string): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: CHANGE_BIRTHDAY,
      variables: {
        id: id,
        birthday: birthday,
      },
    });
  }

  changeLanguage(
    id: string,
    languages: { language: LanguageTypes }[]
  ): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: CHANGE_LANGUAGE,
      variables: {
        id: id,
        languages,
      },
    });
  }

  changeLocation(id: string, location: any): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: CHANGE_LOCATION,
      variables: {
        id: id,
        location: location,
      },
    });
  }

  uploadFile(file: File, id: string) {
    const formData = new FormData();
    formData.append(
      'operations',
      JSON.stringify({
        query: `
        mutation ($input: UploadUserPictureInput!) {
          uploadUserPicture(input: $input) {
            string
          }
        }
      `,
        variables: {
          input: {
            id: id,
            file: null,
          },
        },
      })
    );
    formData.append('map', JSON.stringify({ '0': ['variables.input.file'] }));
    formData.append('0', file);

    return this.http.post('http://localhost:5206/graphql', formData, {
      headers: { 'GraphQL-preflight': '1' },
    });
  }
}
