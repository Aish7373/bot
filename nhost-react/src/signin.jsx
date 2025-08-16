import { useState } from "react"
import { nhost } from "./lib/nhost"

export default function SignIn() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("signin") // "signin" or "signup"
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    try {
      if (mode === "signup") {
        const res = await nhost.auth.signUp({
          email,
          password,
          options: {
            displayName: name, // store the name in Nhost user profile
            metadata: { name }, // also save it in metadata
          },
        })
        if (res.error) throw res.error
        setMessage("✅ Account created! Please check your email.")
      } else {
        const res = await nhost.auth.signIn({
          email,
          password,
        })
        if (res.error) throw res.error
        setMessage("✅ Logged in successfully!")
      }
    } catch (err) {
      setMessage("❌ " + err.message)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "5rem auto", textAlign: "center" }}>
      <h1>Todo Manager</h1>
      <p>powered by Nhost and React</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          {mode === "signup" ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button type="button" onClick={() => setMode("signin")}>Sign In</button>
          </>
        ) : (
          <>
            Don’t have an account?{" "}
            <button type="button" onClick={() => setMode("signup")}>Sign Up</button>
          </>
        )}
      </p>

      {message && <p>{message}</p>}
    </div>
  )
}
