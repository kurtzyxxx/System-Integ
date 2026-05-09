import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<Navigate to="/login" />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home"      element={<Navigate to="/dashboard" />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/admin"     element={<Admin />} />
        <Route path="*"          element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
