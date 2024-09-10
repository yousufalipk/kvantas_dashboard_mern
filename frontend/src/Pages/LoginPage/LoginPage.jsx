import React from 'react';
import { Link } from 'react-router-dom';

// Login Form Import
import LoginForm from '../../Components/Forms/LoginForm/LoginForm';

const LoginPage = () => {
  return (
    <>
        <div className='p-10'>
            {/* Login Form  */}
            <LoginForm />
            <p className='text-bluebtn pl-4'>
              <Link to="/register"> Create an account</Link>
            </p>
        </div>
    </>
  )
}

export default LoginPage;
