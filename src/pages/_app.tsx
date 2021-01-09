import Amplify from '@aws-amplify/core'
import API from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub'
import awsconfig from '../aws-exports'
import { AppProps } from 'next/app'
import Link from 'next/link'
import { AiOutlineHome, AiOutlineUser } from "react-icons/ai";
import '../styles/globals.scss'

Amplify.configure(awsconfig)
API.configure(awsconfig)
PubSub.configure(awsconfig)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <nav className="navigation">
        <ul className="navigation_list">
          <li className="navigation_list_item">
            <Link href="/"><div><AiOutlineHome /></div></Link>
          </li>
          <li className="navigation_list_item">
            <Link href="/profile"><div><AiOutlineUser /></div></Link>
          </li>
        </ul>
      </nav>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp