import React from 'react';
import Logo from '../../Assets/Logo/logo.jpg';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <>
        <div>
          <Link to='/'>
            <p className='mt-8 mx-5 px-7 text-5xl text-white'>Kvants AI</p>
          </Link>
        </div>
    </>
  )
}

export default NavBar;
