import './App.css'
import { NhostProvider } from '@nhost/react'
import { nhost } from './lib/nhost.js'
import SignIn from './signin'
import Todos from './todos'
import { useEffect, useState } from 'react'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // get initial session
    setSession(nhost.auth.getSession())

    // listen for session changes
    nhost.auth.onAuthStateChanged((_, session) => {
      setSession(session)
    })
  }, [])

  return (
    <NhostProvider nhost={nhost}>
      {session ? <Todos session={session} /> : <SignIn />}
    </NhostProvider>
  )
}

export default App
