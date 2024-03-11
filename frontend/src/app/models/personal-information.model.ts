export interface PersonalInformation {
  id: string;
  birthday: string;
  favoriteLocations: string[];
  gender: string;
  image: string;
  kids: KidInformation[];
  languages: string[];
  location: string;
  name: string;
}

export interface KidInformation {
  id: string;
  name: string;
  gender: string;
  birthday: string;
}
