import React from 'react';
import { useFirebase } from '../../Context/Firebase';

import AdminHome from '../AdminHome/AdminHome';
import UserHome from '../UserHome/UserHome';

const HomePage = () => {
  const { userType } = useFirebase();
  return (
    <> 
        <div> 
            <h1 className='font-bold mx-10'>
              {userType === 'admin' ? (
                <>
                  <AdminHome />
                </>
              ):(
                <>
                  <UserHome />
                </>
              )}
            </h1>
        </div>
    </>
  )
}

export default HomePage;
