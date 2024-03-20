import { Button, Container } from "@chakra-ui/react"
import { Navigate, Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import AuthPage from "./pages/AuthPage"
import UpdateProfilePage from "./pages/UpdateProfilePage"
import UserPage from "./pages/UserPage"
import PostPage from "./pages/PostPage"
import Header from "./components/Header"
import CreatePost from "./components/CreatePost"
import { useRecoilValue } from "recoil"
import userAtom from "./atoms/userAtom"

function App() {
  const user = useRecoilValue(userAtom);
  console.log(user);
  return (
    <>
      <Container maxW="620px">
        <Header />
        <Routes>
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
          <Route path="/:username" element={user ? (
            <>
              <UserPage />
              <CreatePost />
            </>
          ) : (
            <UserPage />
          )} />
          <Route path="/:username/post/:post_id" element={<PostPage />} />
        </Routes>
      </Container>

    </>
  )
}

export default App
