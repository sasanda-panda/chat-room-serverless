// MEMO: https://github.com/aws-amplify/amplify-js/issues/1324


// 

// TODO: list
// TODO: subscription
// TODO: SPスタイル

import AWS from 'aws-sdk'
import API, { graphqlOperation } from '@aws-amplify/api'
import Auth from '@aws-amplify/auth'
import { createRef, useEffect, useState } from 'react'
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

  const searchUserTermRef = createRef<HTMLInputElement>()
  const sendMessageContentRef = createRef<HTMLTextAreaElement>()

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
        let attributes: any = {}
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
      const user = await Auth.currentAuthenticatedUser()
      const withData = { filter: { editors: { contains: user.attributes.sub } } }
      const data: any = await API.graphql(graphqlOperation(listRooms, withData))
      // const data: any = await API.graphql(graphqlOperation(listRooms))
      data.data.listRooms.items.sort((a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf())
      data.data.listRooms.items.map((item) => item.messages && item.messages.items.sort((a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()))
      setRooms(data.data.listRooms.items)
      if (data.data.listRooms.items[0]) setCurrentRoom(data.data.listRooms.items[0])
    } catch (err) {
      console.log(err)
    }
  }

  const attachSubscriptions = async () => {
    const user = await Auth.currentAuthenticatedUser()
    const createRoomClient = API.graphql(graphqlOperation(onCreateRoom))
    if ("subscribe" in createRoomClient) {
      createRoomClient.subscribe({
        next: (result: any) => {
          if (result.value.data.onCreateRoom.editors.indexOf(user.attributes.sub) >= 0) {
            setRooms((oldRooms) => [
              ...oldRooms,
              result.value.data.onCreateRoom
            ])
          }
        }
      });
    }
    const createMessageClient = API.graphql(graphqlOperation(onCreateMessage))
    if ("subscribe" in createMessageClient) {
      createMessageClient.subscribe({
        next: (result: any) => {
          if (result.value.data.onCreateMessage.editors.indexOf(user.attributes.sub) >= 0) {
            setRooms((oldRooms) => [...oldRooms].map((room) => {
              if (room.id === result.value.data.onCreateMessage.roomID) {
                return {
                  ...room,
                  messages: {
                    ...room.messages,
                    items: [
                      ...room.messages.items,
                      result.value.data.onCreateMessage
                    ]
                  }
                }
              } else {
                return room
              }
            }))
          }
        }
      });
    }
  }

  useEffect(() => {
    fetchUser()
    fetchAllUser()
    fetchData()
    attachSubscriptions()
  }, [])

  useEffect(() => {
    console.log(rooms)
  }, [rooms])

  // 

  const checkMessageIsOwener = (message: MessageType) => {
    return message.owner === authenticatedUser.sub
  }

  const onChangeSearchText = (value: string) => {
    setSearchUserTerm(value)
  }

  const onClickResultsItem = async (searchedUser: UserType) => {
    const allFriendsUsers = rooms?.map((room) => ({
      room: room,
      sub: room.editors.filter((editor) => editor !== authenticatedUser.sub)[0]
    }))
    try {
      if (allFriendsUsers?.map((user) => user.sub).indexOf(searchedUser.sub) > -1) {
        setCurrentRoom(allFriendsUsers?.filter((user) => user.sub === searchedUser.sub)[0].room)
        setSearchUserTerm('')
      } else {
        const withData = { input: {
          id: Date.now(),
          owner: authenticatedUser.sub,
          editors: [authenticatedUser.sub, searchedUser.sub]
        } }
        const data: any = await API.graphql(graphqlOperation(createRoom, withData))
        setCurrentRoom(data.data.createRoom)
        setSearchUserTerm('')
        sendMessageContentRef.current.focus()
      }
    } catch (err) {
      console.log(err)
    }
  }

  const onClickFriendsItem = (room: RoomType) => {
    setCurrentRoom(room)
  }

  const onClickChatButton = async (room: RoomType) => {
    try {
      const withData = { input: {
        id: Date.now(),
        owner: authenticatedUser.sub,
        editors: room.editors,
        roomID: room.id,
        content: sendMessageContent
      } }
      await API.graphql(graphqlOperation(createMessage, withData))
      setSendMessageContent('')
    } catch (err) {
      console.log(err)
    }
  }

  // 

  return authenticatedUser ? (
    <div className={styles.home}>
      <div className={styles.home_head}>
        <div className={styles.home_head_scroll}>
          <div className={styles.search}>
            <input className={styles.search_text} type="text" placeholder="Enter your friend's name or email" value={searchUserTerm} ref={searchUserTermRef} onChange={(eve) => onChangeSearchText(eve.target.value)} />
            {searchUserTerm !== '' && (
              <ul className={styles.search_results}>
                {filterdAllUsers?.map((user) => (
                  <li key={user.username} className={styles.search_results_item} onClick={() => onClickResultsItem(user)}>
                    {user.username}<span>{user.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* MEMO: 連絡したユーザーリスト */}
          <ul className={styles.friends}>
            {rooms?.map((room) => (
              <li key={room.id} className={`${styles.friends_item} ${room.id === currentRoom?.id ? styles.friends_item_current : ''}`} onClick={() => onClickFriendsItem(room)}>
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
                    <p className={styles.messages_item_content}>{message.content.split('\n').map((s) => (<span key={s}>{s}<br /></span>))}</p>
                  </li>
                ))}
              </ul>
              <div className={styles.chat}>
                <textarea className={styles.chat_text} placeholder="Enter your message" value={sendMessageContent} onChange={(eve) => setSendMessageContent(eve.target.value)}></textarea>
                <button className={styles.chat_button} onClick={() => onClickChatButton(currentRoom)}></button>
              </div>
            </>
          ) : (
            <div className={styles.caution} onClick={() => searchUserTermRef.current.focus()} >Find your friends and start chatting!</div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.home}>
      <div className={styles.home_head}>
        <div className={styles.home_head_scroll}></div>
      </div>
      <div className={styles.home_body}>
        <div className={styles.home_body_scroll}>
          <div className={styles.caution} onClick={() => router.push('/profile')} >Sign in and start chatting!</div>
        </div>
      </div>
    </div>
  )

}

export default Home