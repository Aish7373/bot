import React from "react";
import { NhostProvider, useAuthenticationStatus } from "@nhost/react";
import { nhost } from "./lib/nhost.js";
import ChatPage from "./ChatPage";
import SignIn from "./signin";

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuthenticationStatus();

  if (isLoading) return <p>Loading…</p>;
  if (!isAuthenticated) return <SignIn />;
  if (!user || !user.emailVerified)
    return (
      <div style={{ textAlign: "center", margin: "2rem" }}>
        <h3>Please verify your email address to access the chat.</h3>
        <p>Check your inbox for the verification link.</p>
      </div>
    );
  return <ChatPage />;
}

export default function App() {
  return (
    <NhostProvider nhost={nhost}>
      <AppContent />
    </NhostProvider>
  );
}
