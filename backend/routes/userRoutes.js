const express = require('express');
const router = express.Router();

const {
    createUser,
    loginUser,
    logOutUser,
    refresh,
    fetchUsers,
    deleteUser,
    updateUser,
    downloadUserData,
    createTask,
    fetchTasks,
    updateTask,
    deleteTask,
    fetchTelegramUsers,
    downloadTelegramUserData,
    createDailyTask,
    fetchDailyTasks,
    updateDailyTask,
    deleteDailyTask,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnoucement,
    toggleAnnoucement,
    fetchAnnoucement
} = require ('../controller/userController');

router.route('/register-user').post(createUser);

router.route('/login-user').post(loginUser);

router.route('/logout-user').post(logOutUser);

router.route('/refresh').get(refresh);

router.route('/fetch-users').get(fetchUsers);

router.route('/remove-user').delete(deleteUser);

router.route('/update-user').put(updateUser);

router.route('/downloadUsersData').get(downloadUserData);

router.route('/downloadTeleUsersData').get(downloadTelegramUserData);

router.route('/fetch-telegram-users').get(fetchTelegramUsers);

router.route('/create-social-task').post(createTask);

router.route('/fetch-social-task').get(fetchTasks);

router.route('/update-social-task/:id').post(updateTask);

router.route('/delete-task/:id').delete(deleteTask);

router.route('/create-daily-task').post(createDailyTask);

router.route('/fetch-daily-task').get(fetchDailyTasks);

router.route('/update-daily-task/:id').post(updateDailyTask);

router.route('/delete-daily/:id').delete(deleteDailyTask);

router.route('/create-annoucement').post(createAnnouncement);

router.route('/update-annoucement').put(updateAnnouncement);

router.route('/remove-annoucement/:id').delete(deleteAnnoucement);

router.route('/fetch-annoucements').get(fetchAnnoucement);

router.route('/toggle-annoucement').post(toggleAnnoucement);



module.exports = router;