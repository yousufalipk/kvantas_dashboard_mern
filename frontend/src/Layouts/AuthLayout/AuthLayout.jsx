import React from 'react';
import { Routes, Route } from 'react-router-dom';

//Importing LogIn & SignUp Page
import LoginPage from '../../Pages/LoginPage/LoginPage';
import SignUpPage from '../../Pages/SignupPage/SignupPage';

//NavBar
import NavBar from '../../Components/NavBar/NavBar';

//Vector Image 
import AuthImage from '../../Assets/auth-img.png';

const AuthLayout = () => {
  return (
    <>
    <div className='flex bg-custom-image bg-cover bg-center items-center'>
      {/* Left Auth */}
      <div className=' w-1/2 p-20'>
        {/* Nav Bar */} 
        <div>
          <NavBar />
        </div>
        <div>
          <Routes>
            <Route path="*" element={<LoginPage />} />
            <Route path="/register" element={<SignUpPage toggle={false} tick={false} />} />
          </Routes>
        </div>
      </div>
      {/* Right Image */}
      <div className='w-2/2'>
        <img className='h-screen px-5 ml-3' src={AuthImage} alt="Vector Image" />
      </div>
    </div>
    </>
  )
}

export default AuthLayout
