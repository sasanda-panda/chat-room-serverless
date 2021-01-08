// MEMO: https://github.com/aws-amplify/amplify-js/issues/1324
// TODO: createRoom
//       id?: string | null,
//       editors: Array< string | null >,
//       roomID: string,
//       content: string,

// TODO: 検索フォームを作る
// TODO: メンバーをクリックしたらチャット開始
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
  editors: string[],
  messages: MessageType[]
}

type MessageType = {
  id: string,
  editors: string[],
  roomID: string,
  room: RoomType,
  content: string,
}

const Home: NextPage = () => {

  const [allUsers, setAllUsers] = useState<UserType[]|null>(null)
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType|null>(null)
  const [searchText, setSearchText] = useState<string>('')
  const [currentRoom, setCurrentRoom] = useState<RoomType|null>(null)

  // 

  const router = useRouter()

  // 

  const filterdAllUsers = allUsers?.filter((user) => {
    if (searchText !== '') {
      if (user.username.indexOf(searchText) === 0 || user.email.indexOf(searchText) === 0) {
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
      const d = await API.graphql(graphqlOperation(listRooms))
      console.log(d)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUser()
    fetchAllUser()
    fetchData()
  }, [])

  // 

  const createRoomAsync = async () => {
    try {
      const withData = { input: {
        id: Date.now(),
        editors: [authenticatedUser.sub, 'b3ed2023-aa61-42ce-baf0-a3d5b152f953']
      } }
      const a = await API.graphql(graphqlOperation(createRoom, withData))
      console.log(a)
    } catch (err) {
      console.log(err)
    }
  }

  // 

  return authenticatedUser ? (
    <div className={styles.home}>
      <div className={styles.home_head}>
        {/* MEMO: ユーザー検索欄 */}
        <div className={styles.search}>
          <input className={styles.search_text} type="text" value={searchText} onChange={(eve) => setSearchText(eve.target.value)}/>
          {searchText !== '' && (
            <ul className={styles.search_result}>
              {filterdAllUsers?.map((user) => (
                <li key={user.username} className={styles.search_result_item}>
                  <p>{user.username}</p>
                </li>
              ))}
            </ul>
          )}
          {/* <button onClick={() => createRoomAsync()}>createRoomAsync</button> */}
        </div>
        {/* MEMO: 連絡したユーザーリスト */}
        <ul>
          <li></li>
        </ul>
      </div>
      <div className={styles.home_body}>
        {/* MEMO: チャット欄 */}
        <div></div>
      </div>
    </div>
  ) : (
    <div>Home - not authenticated</div>
  )

}

export default Home