// MEMO: https://github.com/aws-amplify/amplify-js/issues/1324

// TODO: スタイル調整
// TODO: list
// TODO: subscription

import AWS from 'aws-sdk'
import API, { graphqlOperation } from '@aws-amplify/api'
import Auth from '@aws-amplify/auth'
import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { listRooms } from '../graphql/queries'
import { createRoom, deleteRoom, createMessage, deleteMessage } from '../graphql/mutations'
import { onCreateRoom, onDeleteRoom, onCreateMessage, onDeleteMessage } from '../graphql/subscriptions'
import styles from '../styles/Home.module.scss'
import { create } from 'domain'

const awsconfig = {
  apiVersion: '2016-04-18',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-northeast-1',
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.AWS_IDENTITY_POOL_ID,
  })
}
AWS.config.update(awsconfig)

type UserType = {
  username: string,
  email: string,
  sub: string,
}

type AuthenticatedUserType = {
  username: string,
  email: string,
  email_verified: boolean,
  sub: string
}

type RoomType = {
  id: string,
  owner: string,
  editors: string[],
  messages: { items: MessageType[] }
}

type MessageType = {
  id: string,
  owner: string,
  editors: string[],
  roomID: string,
  room: RoomType,
  content: string,
}

const Home: NextPage = () => {

  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType|null>(null)
  const [allUsers, setAllUsers] = useState<UserType[]|null>(null)
  const [searchUserTerm, setSearchUserTerm] = useState<string>('')
  const [rooms, setRooms] = useState<RoomType[]|null>(null)
  const [currentRoom, setCurrentRoom] = useState<RoomType|null>(null)
  const [sendMessageContent, setSendMessageContent] = useState<string>('')

  // 

  const router = useRouter()

  // 

  const filterdAllUsers = allUsers?.filter((user) => {
    if (searchUserTerm !== '') {
      if (authenticatedUser.sub !== user.sub && (user.username.indexOf(searchUserTerm) === 0 || user.email.indexOf(searchUserTerm) === 0)) {
      return true
      } else {
        return false
      }
    } else {
      return false
    }
  })

  const fetchUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      setAuthenticatedUser({
        username: user.username,
        sub: user.attributes.sub,
        email: user.attributes.email,
        email_verified: user.attributes.email_verified
      })
    } catch (err) {
      console.log(err)
    }
  }

  const fetchAllUser = async () => {
    const cognito = new AWS.CognitoIdentityServiceProvider()
    try {
      let params = {
        UserPoolId: process.env.AWS_USER_POOL_ID,
        Limit: 50
      }
      const rawUsers = await cognito.listUsers(params).promise()
      const mapUsers = rawUsers.Users.map(user => {
        let attributes = {}
        for (const attribute of user.Attributes) attributes[attribute.Name] = attribute.Value
        return {
          username: user.Username,
          email: attributes.hasOwnProperty('email') ? attributes.email : '',
          sub: attributes.hasOwnProperty('sub') ? attributes.sub : '',
        }
      })
      setAllUsers([...mapUsers])
    } catch (err) {
      console.log(err)
    }
  }

  const fetchData = async () => {
    try {
      const data: any = await API.graphql(graphqlOperation(listRooms))
      setRooms(data.data.listRooms.items)
    } catch (err) {
      console.log(err)
    }
  }

  const attachSubscriptions = async () => {
    // const createRoomClient = API.graphql(graphqlOperation(onCreateRoom))
    // if ("subscribe" in createRoomClient) {
    //   createRoomClient.subscribe({
    //     next: (result: any) => {
    //       alert('onCreateRoom')
    //     }
    //   })
    // }
    // const createMessageClient = API.graphql(graphqlOperation(onCreateMessage))
    // if ("subscribe" in createMessageClient) {
    //   createMessageClient.subscribe({
    //     next: (result: any) => {
    //       alert('onCreatMessage')
    //     }
    //   })
    // }
  }

  useEffect(() => {
    fetchUser()
    fetchAllUser()
    fetchData()
    attachSubscriptions()
  }, [])

  // 

  const checkMessageIsOwener = (message: MessageType) => {
    return message.owner === authenticatedUser.sub
  }

  const createRoomAsync = async (friendUser: UserType) => {
    try {
      const withData = { input: {
        id: Date.now(),
        editors: [authenticatedUser.sub, friendUser.sub]
      } }
      const data: any = await API.graphql(graphqlOperation(createRoom, withData))
      setCurrentRoom(data.data.createRoom)
      setSearchUserTerm('')
    } catch (err) {
      console.log(err)
    }
  }

  const createMessageAsync = async (room: RoomType) => {
    try {
      const withData = { input: {
        id: Date.now(),
        editors: room.editors,
        roomID: room.id,
        content: sendMessageContent
      } }
      const data: any = await API.graphql(graphqlOperation(createMessage, withData))
    } catch (err) {
      console.log(err)
    }
  }

  const onChangeSearchText = (value: string) => {
    setSearchUserTerm(value)
  }

  const onClickResultsItem = async () => {
    // 履歴があればsetCurrentRoom
    // なければ作成
  }

  const onClickFriendsItem = (room: RoomType) => {
    setCurrentRoom(room)
  }

  // 

  return authenticatedUser ? (
    <div className={styles.home}>
      <div className={styles.home_head}>
        <div className={styles.home_head_scroll}>
          <div className={styles.search}>
            <input className={styles.search_text} type="text" placeholder="Enter your friend's name or email" value={searchUserTerm} onChange={(eve) => onChangeSearchText(eve.target.value)} />
            {searchUserTerm !== '' && (
              <ul className={styles.search_results}>
                {filterdAllUsers?.map((user) => (
                  <li key={user.username} className={styles.search_results_item} onClick={() => createRoomAsync(user)}>
                    {user.username}<span>{user.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* MEMO: 連絡したユーザーリスト */}
          <ul className={styles.friends}>
            {rooms?.map((room) => (
              <li key={room.id} className={styles.friends_item} onClick={() => onClickFriendsItem(room)}>
                {allUsers?.filter((user) => user.sub === room.editors.filter((editor) => editor !== authenticatedUser.sub)[0])[0].username}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.home_body}>
        <div className={styles.home_body_scroll}>
          {currentRoom ? (
            <>
              <ul className={styles.messages}>
                {currentRoom.messages?.items?.map((message) => (
                  <li key={message.id} className={`${styles.messages_item} ${checkMessageIsOwener(message) ? styles.messages_item_right : styles.messages_item_left }`}>
                    <p className={styles.messages_item_content}>{message.content.split('\n').map((s) => (<>{s}<br /></>))}</p>
                  </li>
                ))}
              </ul>
              <div className={styles.chat}>
                <textarea className={styles.chat_text} placeholder="Enter your message" value={sendMessageContent} onChange={(eve) => setSendMessageContent(eve.target.value)}></textarea>
                <button className={styles.chat_button} onClick={() => createMessageAsync(currentRoom)}></button>
              </div>
            </>
          ) : (
            (rooms && rooms[0]) ? (
              <>
                <ul className={styles.messages}>
                  {rooms[0].messages?.items?.map((message) => (
                    <li key={message.id} className={`${styles.messages_item} ${checkMessageIsOwener(message) ? styles.messages_item_right : styles.messages_item_left }`}>
                      <p className={styles.messages_item_content}>{message.content.split('\n').map((s) => (<>{s}<br /></>))}</p>
                    </li>
                  ))}
                </ul>
                <div className={styles.chat}>
                  <textarea className={styles.chat_text} placeholder="Enter your message" value={sendMessageContent} onChange={(eve) => setSendMessageContent(eve.target.value)}></textarea>
                  <button className={styles.chat_button} onClick={() => createMessageAsync(rooms[0])}></button>
                </div>
              </>
            ) : (
              <div>チャットを始めよう</div>
            )
          )}
        </div>
      </div>
    </div>
  ) : (
    <div>Home - not authenticated</div>
  )

}

export default Home