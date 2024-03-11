import { Routes } from '@angular/router';
import { MeetComponent } from './meet/meet/meet.component';
import { ChatComponent } from './chat/chat/chat.component';
import { MapComponent } from './maps/map/map.component';
import { CalendarComponent } from './calendar/calendar/calendar.component';
import { EventsComponent } from './maps/events/events.component';
import { PlacesComponent } from './maps/places/places.component';
import { LoginComponent } from './account/login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RegisterComponent } from './account/register/register.component';
import { AccountComponent } from './account/account/account.component';
import { AuthorizationGuard } from './authorization.guard';
import { ConfirmEmailComponent } from './account/confirm-email/confirm-email.component';
import { ResendEmailComponent } from './account/resend-email/resend-email.component';
import { ResetPasswordComponent } from './account/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './account/forgot-password/forgot-password.component';
import { RegisterWithThirdPartyComponent } from './account/register-with-third-party/register-with-third-party.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'meet', component: MeetComponent, canActivate: [AuthorizationGuard] },
  { path: 'chat/:chatId', component: ChatComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'resend-email', component: ResendEmailComponent },
  { path: 'account', component: AccountComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthorizationGuard],
  },
  {
    path: 'register-with-third-party/:provider',
    component: RegisterWithThirdPartyComponent,
  },

  {
    path: 'navigate',
    component: MapComponent,
    children: [
      {
        path: 'events',
        component: EventsComponent,
      },
      {
        path: 'places',
        component: PlacesComponent,
      },
      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full',
      },
    ],
  },
  { path: 'plan', component: CalendarComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];
