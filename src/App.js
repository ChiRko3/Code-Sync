import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import EditorPage from './pages/EditorPage'
import { Toaster } from 'react-hot-toast'
const App = () => {
  return (
    <>
      <div>
        <Toaster position='top-right'>
        </Toaster>
      </div>
      <Router>
        <Routes>
          <Route path='/' exact element={<Home />} />
          <Route path='/editor/:RoomId' element={<EditorPage />} />
        </Routes>
      </Router>
    </>

  )
}

export default App