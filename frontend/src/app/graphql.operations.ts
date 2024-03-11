import { gql } from 'apollo-angular';

const INIT_USER = gql`
  mutation InitUser($id: String!, $name: String!) {
    addUser(input: { userInput: { id: $id, name: $name } }) {
      userMutationResult {
        id
        name
      }
    }
  }
`;

const CHANGE_NAME = gql`
  mutation UpdateUser($id: String!, $name: String!) {
    updateUser(input: { userInput: { id: $id, name: $name } }) {
      userMutationResult {
        id
        name
      }
    }
  }
`;

const CHANGE_BIRTHDAY = gql`
  mutation UpdateUser($id: String!, $birthday: DateTime!) {
    updateUser(input: { userInput: { id: $id, birthday: $birthday } }) {
      userMutationResult {
        id
        birthday
      }
    }
  }
`;
const CHANGE_LANGUAGE = gql`
  mutation UpdateUser($id: String!, $languages: [LanguageModelInput!]!) {
    updateUser(input: { userInput: { id: $id, languages: $languages } }) {
      userMutationResult {
        id
        languages {
          language
        }
      }
    }
  }
`;

const CHANGE_LOCATION = gql`
  mutation UpdateUser($id: String!, $location: LocationTypeInput!) {
    updateUser(input: { userInput: { id: $id, location: $location } }) {
      userMutationResult {
        id
        location {
          character
          latitude
          longitude
          name
          address
        }
      }
    }
  }
`;

const FIND_USER = gql`
  query FindUser($id: String!) {
    userById(id: $id) {
      id
      name
      image
      birthday
      languages {
        language
      }
      location {
        latitude
        longitude
        address
        locationId
      }
      kids {
        id
        name
        birthday
        gender
      }
      locations {
        locationId
        latitude
        longitude
        address
        character
        name
      }
    }
  }
`;

const FILE_UPLOAD = gql`
  mutation ($input: UploadUserPictureInput!) {
    uploadUserPicture(input: $input) {
      string
    }
  }
`;

const GET_ALL_USERS = gql`
  query GetAllUsersExceptOne($id: String!, $filterOption: String!) {
    allUsers(
      id: $id
      filterOption: $filterOption
      where: { id: { neq: $id } }
    ) {
      id
      name
      image
      birthday
      languages {
        language
      }
      location {
        latitude
        longitude
        address
        locationId
      }
      kids {
        id
        name
        birthday
        gender
      }
      locations {
        locationId
        latitude
        longitude
        address
        character
        name
      }
      distanceFromUser
      kidsAgeDifference
      sameFavPlaces
      sameLang
    }
  }
`;

const CREATE_CHAT = gql`
  mutation AddChat($idUser1: String!, $idUser2: String!) {
    addChat(input: { chatInput: { idUser1: $idUser1, idUser2: $idUser2 } }) {
      chatMutationResult {
        id
        users {
          id
          name
          image
        }
        lastMessage {
          text
          id
          from {
            id
          }
          to {
            id
          }
          date
        }
      }
    }
  }
`;

const GET_ALL_CHATS = gql`
  query getAllChats($userId: String!) {
    allChats(userId: $userId) {
      id
      users {
        id
        name
        image
      }
      lastMessage {
        id
        from {
          id
        }
        to {
          id
        }
        text
        date
      }
    }
  }
`;

const MESSAGES_SUB = gql`
  subscription messages($userId: String!) {
    onMessageReceived(userId: $userId) {
      id
      text
      chatId
      date
      to {
        id
        name
        image
      }
      from {
        id
        name
        image
      }
    }
  }
`;

const GET_ALL_MESSAGES = gql`
  query getAllMessages($chatId: String!) {
    allMessages(chatId: $chatId) {
      id
      text
      date
      from {
        id
        name
        image
      }
      to {
        id
        name
        image
      }
    }
  }
`;

const GET_CHAT_BY_ID = gql`
  query getChat($id: String!) {
    chatById(id: $id) {
      users {
        id
        name
        image
      }
      messages {
        id
        text
        chatId
        date
        from {
          id
          name
          image
        }
        to {
          id
          name
          image
        }
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation sendMessage(
    $chatId: String!
    $date: String!
    $text: String!
    $userFromId: String!
  ) {
    createMessage(
      input: {
        chatId: $chatId
        date: $date
        text: $text
        userFromId: $userFromId
      }
    ) {
      messageMutationResult {
        id
        text
        chatId
        date
        from {
          id
          name
          image
        }
        to {
          id
          name
          image
        }
      }
    }
  }
`;

const ADD_FAVORITE_LOCATION = gql`
  mutation AddFavoriteLocation(
    $id: String!
    $locations: [LocationModelInput!]!
  ) {
    updateUser(input: { userInput: { id: $id, locations: $locations } }) {
      userMutationResult {
        id
        location {
          address
          latitude
          longitude
        }
        locations {
          locationId
          name
          address
          latitude
          longitude
          character
        }
      }
    }
  }
`;

const DELETE_FAVORITE_LOCATION = gql`
  mutation DeleteFavoriteLocation($userId: String!, $locationId: String!) {
    removeLocationFromUser(
      input: { userId: $userId, locationId: $locationId }
    ) {
      boolean
    }
  }
`;

const DELETE_KID = gql`
  mutation DeleteKidEntry($id: String!) {
    deleteKid(input: { id: $id }) {
      boolean
    }
  }
`;

const ADD_KID = gql`
  mutation AddKidEntry($id: String!, $kids: [KidModelInput!]!) {
    updateUser(input: { userInput: { id: $id, kids: $kids } }) {
      userMutationResult {
        id
        kids {
          id
          name
          birthday
          gender
        }
      }
    }
  }
`;

const GET_ALL_LOCATIONS = gql`
  query {
    allLocations {
      locationId
      name
      address
      latitude
      longitude
      character
      users {
        id
        name
        image
      }
    }
  }
`;

export {
  INIT_USER,
  FIND_USER,
  FILE_UPLOAD,
  CHANGE_NAME,
  CHANGE_BIRTHDAY,
  CHANGE_LANGUAGE,
  GET_ALL_USERS,
  CREATE_CHAT,
  GET_ALL_CHATS,
  MESSAGES_SUB,
  GET_ALL_MESSAGES,
  CHANGE_LOCATION,
  ADD_FAVORITE_LOCATION,
  DELETE_FAVORITE_LOCATION,
  DELETE_KID,
  ADD_KID,
  GET_CHAT_BY_ID,
  SEND_MESSAGE,
  GET_ALL_LOCATIONS,
};
