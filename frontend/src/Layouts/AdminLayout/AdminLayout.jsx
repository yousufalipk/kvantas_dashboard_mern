import React from 'react';
import {Routes, Route} from 'react-router-dom';

import SideBar from '../../Components/SideBar/SideBar';

import HomePage from '../../Pages/HomePage/HomePage';


//Manage Users
import ManageUsersPage from '../../Pages/ManageUsers/ManageUser';
import UpdateUserForm from '../../Components/Forms/UpdateUserFrom/UpdateUserForm';
import RegisterForm from '../../Components/Forms/SignUpForm/SignUpForm';

//Manage Social Tasks
import SocialTaskPage from '../../Pages/SocialTask/SocialTask';
import SocialTaskFrom from '../../Components/Forms/SocialTaskForm/SocialTaskForm';

//Manage Social Tasks
import DailyTaskPage from '../../Pages/DailyTask/DailyTask';
import DailyTaskFrom from '../../Components/Forms/DailyTaskForm/DailyTaskFrom';

//Telegram Users
import ManageTelegramUsers from '../../Pages/ManageTelegramUsers/ManageTelegramUsers';

//Anoucements
import Annoucement from '../../Pages/Annoucements/Annoucement';
import AnnoucementForm from '../../Components/Forms/AnnoucementForm/AnnoucementForm';

import UserProtected from '../../Components/Protected/UserProtected';

const AdminLayout = () => {
  return (
    <>  
        {/* Side Bar */}
        <div className='flex flex-row bg-custom-image bg-cover bg-center'>
          <div className='w-1/5'>
            <SideBar />
          </div> 
          {/* Content */}
          <div className='p-10 w-full'> 
          <Routes> 
            <Route path='*' element={<HomePage />}/> 

            {/* Admin Routes */}

            {/* Manage User Routes  */}
            <Route path='/manage-users' element={<UserProtected ><ManageUsersPage /></UserProtected>}/>
            <Route path='/update-user/:userId/:fname/:lname/:email' element={<UserProtected ><UpdateUserForm /></UserProtected>}/> 
            <Route path='/add-user' element={<UserProtected ><RegisterForm toggle={true} tick={false}/></UserProtected>}/> 

            {/* Manage Social Tasks */}
            <Route path='/social-tasks' element={<UserProtected ><SocialTaskPage /></UserProtected>}/>
            <Route path='/social-tasks-form/:tick' element={<UserProtected ><SocialTaskFrom /></UserProtected>}/>
            <Route path='/social-tasks-form-update/:tick/:uid/:priority/:type/:title/:reward/:link' element={<UserProtected ><SocialTaskFrom /></UserProtected>}/>
            
            {/* Manage Daily Tasks */}
            <Route path='/daily-tasks' element={<UserProtected ><DailyTaskPage /></UserProtected>}/>
            <Route path='/daily-tasks-form/:tick' element={<UserProtected ><DailyTaskFrom /></UserProtected>}/>
            <Route path='/daily-tasks-form-update/:tick/:uid/:priority/:type/:title/:reward/:link' element={<UserProtected ><DailyTaskFrom /></UserProtected>}/>

            {/* Manage User Routes  */}
            <Route path='/manage-telegram-users' element={<UserProtected ><ManageTelegramUsers /></UserProtected>}/>

            {/* Annoucements */}
            <Route path='/annoucements' element={<UserProtected ><Annoucement /></UserProtected>}/>
            <Route path='/annoucement-form/:tick' element={<UserProtected ><AnnoucementForm /></UserProtected>}/>
            <Route path='/annoucement-form-update/:tick/:uid/:title/:subtitle/:description/:reward/:imageName' element={<UserProtected ><AnnoucementForm /></UserProtected>}/>

          </Routes>
          </div>
        </div>
    </>
  )
}

export default AdminLayout
