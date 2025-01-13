import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import MainPage from "./components/Chat/MainPage";
import AppLayout from "./AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={"/"} element={<Navigate to={"/login"} replace />} />
          <Route index path="/login" element={<Login />} />
          <Route path="/chat" element={<MainPage />} />
          <Route path="*" element={<Navigate to={"/login"} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
// Things to do:
/*
  Correct the login users logic
  hide the logout button in the room show that only outside the room
  take the states from main page to useSocket logic
  style my way.
 */
