import Auth from '@aws-amplify/auth'
import { FC, useEffect, useState, Children } from 'react'

type AuthenticatedUserType = {
  username: string,
  email: string,
  email_verified: boolean
}

const ProtectedPage: FC = ({ children }) => {

  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserType|null>(null)

  const fetchUser = async () => {
    try {
      const user = Auth.currentAuthenticatedUser()
      setAuthenticatedUser({
        username: user.username,
        email: user.attributes.email,
        email_verified: user.attributes.email_verified
      })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return authenticatedUser ? (
    <div><Children {...authenticatedUser}></div>
  ) : (
    <div>not authenticated</div>
  )

}

export default ProtectedPage