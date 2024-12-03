import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Landing_page from './component/landing_page/landing_page'
import Login from './component/login_page/Login'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing_page />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
