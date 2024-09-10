import React from 'react';
import { Link } from 'react-router-dom';

// Sign Up Form Import 
import SignUpForm from '../../Components/Forms/SignUpForm/SignUpForm';

const SignupPage = (props) => {
  return (
    <>
        <div className='p-10'>
            {/* SignUp Form */}
            <SignUpForm setAuth={props.setAuth} toggle={props.toggle} tick={props.false}/>
            <p className='pl-4 text-white'>
              Already have an account? <span className='text-bluebtn'><Link to="/"> Log In</Link></span>
            </p>
        </div>
    </>
  )
}

export default SignupPage;
