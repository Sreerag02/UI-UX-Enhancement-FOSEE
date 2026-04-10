import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Activation from './pages/Activation'
import Statistics from './pages/Statistics'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/workshop/activate_user/" element={<Activation />} />
        <Route path="/activate" element={<Activation />} />
        <Route path="/stats" element={<Statistics />} />
      </Routes>
    </BrowserRouter>
  )
}
