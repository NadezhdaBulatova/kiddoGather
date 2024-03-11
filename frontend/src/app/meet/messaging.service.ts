import { Injectable, signal } from '@angular/core';
import { Apollo, MutationResult } from 'apollo-angular';
import { Observable } from 'rxjs';
import {
  CREATE_CHAT,
  GET_ALL_CHATS,
  GET_ALL_MESSAGES,
  GET_CHAT_BY_ID,
  MESSAGES_SUB,
  SEND_MESSAGE,
} from '../graphql.operations';
import { ApolloQueryResult } from '@apollo/client';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  public chats = signal<any[]>([]);
  constructor(private apollo: Apollo) {}

  createChat(id1: string, id2: string): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: CREATE_CHAT,
      variables: {
        idUser1: id1,
        idUser2: id2,
      },
    });
  }
  getAllChats(userId: string): Observable<ApolloQueryResult<any>> {
    return this.apollo.query({
      query: GET_ALL_CHATS,
      variables: {
        userId,
      },
    });
  }
  getMessages(userId: string): Observable<any> {
    return this.apollo.subscribe({
      query: MESSAGES_SUB,
      variables: {
        userId: userId,
      },
    });
  }

  getAllMessages(chatId: string): Observable<any> {
    return this.apollo.query({
      query: GET_ALL_MESSAGES,
      variables: {
        chatId,
      },
    });
  }

  getChatById(id: string): Observable<any> {
    return this.apollo.query({
      query: GET_CHAT_BY_ID,
      variables: {
        id,
      },
    });
  }

  createMessage(
    chatId: string,
    date: string,
    text: string,
    userFromId: string
  ): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: SEND_MESSAGE,
      variables: {
        chatId,
        date,
        text,
        userFromId,
      },
    });
  }
}
