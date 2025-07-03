import '../styles/globals.css'
import type { AppProps } from 'next/app'
import StacksProvider from '../lib/StacksProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StacksProvider>
      <Component {...pageProps} />
    </StacksProvider>
  )
}
