export class LoginWithThirdPartyModel {
  userId: string;
  accessToken: string;
  provider: string;

  constructor(userId: string, accessToken: string, provider: string) {
    this.provider = provider;
    this.userId = userId;
    this.accessToken = accessToken;
  }
}
