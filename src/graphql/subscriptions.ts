/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateRoom = /* GraphQL */ `
  subscription OnCreateRoom($owner: String!, $editors: String!) {
    onCreateRoom(owner: $owner, editors: $editors) {
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
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateRoom = /* GraphQL */ `
  subscription OnUpdateRoom($owner: String!, $editors: String!) {
    onUpdateRoom(owner: $owner, editors: $editors) {
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
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteRoom = /* GraphQL */ `
  subscription OnDeleteRoom($owner: String!, $editors: String!) {
    onDeleteRoom(owner: $owner, editors: $editors) {
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
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage($owner: String!, $editors: String!) {
    onCreateMessage(owner: $owner, editors: $editors) {
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
        owner
      }
      content
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage($owner: String!, $editors: String!) {
    onUpdateMessage(owner: $owner, editors: $editors) {
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
        owner
      }
      content
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage($owner: String!, $editors: String!) {
    onDeleteMessage(owner: $owner, editors: $editors) {
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
        owner
      }
      content
      createdAt
      updatedAt
      owner
    }
  }
`;
