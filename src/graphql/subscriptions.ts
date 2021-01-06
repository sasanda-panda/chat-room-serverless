/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateRoom = /* GraphQL */ `
  subscription OnCreateRoom($editors: String!) {
    onCreateRoom(editors: $editors) {
      id
      editors
      messages {
        items {
          id
          editors
          roomID
          content
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateRoom = /* GraphQL */ `
  subscription OnUpdateRoom($editors: String!) {
    onUpdateRoom(editors: $editors) {
      id
      editors
      messages {
        items {
          id
          editors
          roomID
          content
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteRoom = /* GraphQL */ `
  subscription OnDeleteRoom($editors: String!) {
    onDeleteRoom(editors: $editors) {
      id
      editors
      messages {
        items {
          id
          editors
          roomID
          content
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage($editors: String!) {
    onCreateMessage(editors: $editors) {
      id
      editors
      roomID
      room {
        id
        editors
        messages {
          nextToken
        }
        createdAt
        updatedAt
      }
      content
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage($editors: String!) {
    onUpdateMessage(editors: $editors) {
      id
      editors
      roomID
      room {
        id
        editors
        messages {
          nextToken
        }
        createdAt
        updatedAt
      }
      content
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage($editors: String!) {
    onDeleteMessage(editors: $editors) {
      id
      editors
      roomID
      room {
        id
        editors
        messages {
          nextToken
        }
        createdAt
        updatedAt
      }
      content
      createdAt
      updatedAt
    }
  }
`;
