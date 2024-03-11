import { Component, Input, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatOverviewComponent } from '../chat-overview/chat-overview.component';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MessagingService } from '../../meet/messaging.service';
import { AccountService } from '../../account/account.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    ChatOverviewComponent,
    ChatBoxComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {
  overview = true;
  messages: any[] = [];
  title: string = '';
  chatId = '';

  constructor(
    private activeRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    protected messageService: MessagingService,
    private accountService: AccountService
  ) {}

  form = new FormGroup({
    text: new FormControl(''),
  });

  onSubmit(): void {
    if (this.form.value.text) {
      this.messageService
        .createMessage(
          this.chatId,
          '',
          this.form.value.text,
          this.accountService.user.id
        )
        .subscribe({
          next: (res) => {
            console.log(res);
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  onClose() {
    this.router.navigateByUrl('/chat');
  }

  getChatWith(chat: any) {
    return chat?.users.find(
      (user: any) => user.id !== this.accountService.user.id
    );
  }

  getLastMessageDate(chat: any) {
    return new Date(chat?.lastMessage?.date);
  }

  checkImage(image: any) {
    if (!image) {
      return '../../../assets/icons/user.png';
    } else {
      return `http://localhost:5206/${image}`;
    }
  }

  getMessageDate(message: any) {
    return new Date(message.date);
  }

  isMessageActive(message: any): boolean {
    return message.from.id === this.accountService.user.id;
  }

  ngOnInit() {
    this.activeRoute.params.subscribe((params) => {
      if (params['chatId']) {
        this.activeRoute.paramMap.subscribe((params) => {
          let chatId = params.get('chatId');
          if (chatId) {
            this.messageService.getChatById(chatId).subscribe({
              next: (res) => {
                this.messages = res.data.chatById.messages;
                this.overview = false;
                if (chatId) this.chatId = chatId;
                const userToCommunicate = res.data.chatById.users.filter(
                  (user: any) => user.id !== this.accountService.user.id
                )[0];
                this.title = `Chat with ${userToCommunicate.name}`;
                this.cdr.detectChanges();
              },
              error: (err) => {
                console.log(err);
              },
            });
          }
        });
      }
    });
    if (this.overview) {
      this.messageService.getAllChats(this.accountService.user.id).subscribe({
        next: (res) => {
          console.log(res);
          this.messageService.chats.set(res.data.allChats);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
          this.cdr.detectChanges();
        },
      });
    }

    this.messageService.getMessages(this.accountService.user.id).subscribe({
      next: (res) => {
        if (res.data.onMessageReceived.chatId === this.chatId) {
          this.messages = [...this.messages, res.data.onMessageReceived];
          this.messageService.chats.set([
            ...this.messageService.chats().map((chat) => {
              if (chat.id === this.chatId) {
                return {
                  ...chat,
                  messages: this.messages,
                  lastMessage: res.data.onMessageReceived,
                };
              }
              return chat;
            }),
          ]);
          this.form.reset();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
