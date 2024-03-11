import { Injectable, signal } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { GET_ALL_LOCATIONS } from '../graphql.operations';

@Injectable({
  providedIn: 'root',
})
export class MapsServiceService {
  public locations = signal<any[]>([]);
  constructor(private apollo: Apollo) {}

  getAllLocations(): Observable<ApolloQueryResult<any>> {
    console.log('Called');
    return this.apollo.query({
      query: GET_ALL_LOCATIONS,
    });
  }
}
