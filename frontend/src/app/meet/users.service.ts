import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { GET_ALL_USERS } from '../graphql.operations';
import { AccountService } from '../account/account.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private apollo: Apollo, private accountService: AccountService) {}

  getAllUsers(
    filterOption: string = 'distance'
  ): Observable<ApolloQueryResult<any>> {
    return this.apollo.query({
      query: GET_ALL_USERS,
      variables: {
        id: this.accountService.user.id,
        filterOption,
      },
    });
  }
}
