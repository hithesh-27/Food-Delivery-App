import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import { Route, Routes } from 'react-router-dom'
import Cart from './pages/Cart/Cart'
import Home from './pages/Home/Home'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Verify from './pages/Verify/Verify'
import Orders from './pages/Orders/Orders'

const App = () => {

  const [showLogin,setShowLogin] = useState(false)
  return (
    <>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <div className='app'>
      <Navbar setShowLogin={setShowLogin}/>
      <Routes>
        <Route path= '/' element={<Home/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/order' element={<PlaceOrder/>}/>
        <Route path='/orders' element={<Orders/>}/>
        <Route path='/verify' element={<Verify/>}/>
      </Routes>
    </div>
    <Footer/>
    </>
  )
}

export default App
