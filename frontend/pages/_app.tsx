import '../styles/globals.css'
import type { AppProps } from 'next/app'
import StacksProvider from '../lib/StacksProvider'
import { NotificationProvider } from '../components/NotificationProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StacksProvider>
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </StacksProvider>
  )
}
