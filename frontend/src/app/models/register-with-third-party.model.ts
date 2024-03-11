export class RegisterWithThirdPartyModel {
  nickname: string;
  userId: string;
  accessToken: string;
  provider: string;

  constructor(
    nickname: string,
    userId: string,
    accessToken: string,
    provider: string
  ) {
    this.nickname = nickname;
    this.provider = provider;
    this.userId = userId;
    this.accessToken = accessToken;
  }
}
