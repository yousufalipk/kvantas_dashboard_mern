import React, { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, query, where, addDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { getStorage, deleteObject } from 'firebase/storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseUrl: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
};


// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const FirebaseContext = createContext(null);

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {

    const apiUrl = process.env.REACT_APP_API_URL;

    const [userId, setUserId] = useState(null);

    const [username, setUsername] = useState(null);

    const [userType, setUserType] = useState(null);

    const [isAuth, setAuth] = useState(null);

    const [users, setUsers] = useState([]);

    const [telegramUsers, setTelegramUsers] = useState([]);

    const [annoucement, setAnnoucement] = useState([]);

    const [loading, setLoading] = useState(false);

    const [tasks, setTasks] = useState([]);

    const [dailyTasks, setDailyTasks] = useState([]);

    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        //calculateDashboardMetrics();

        const refreshAuth = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${apiUrl}/refresh`, {
                    withCredentials: true,
                });
                console.log(response);
                if (response.data.status === 'success') {
                    setUserId(response.data.user._id);
                    setAuth(response.data.auth);
                    setUsername(`${response.data.user.fname} ${response.data.user.lname}`);
                    setUserType(response.data.user.userType);
                }
                else {
                    setAuth(false);
                    setUsername(null);
                    setUserId(null);
                    setUserType(null);
                }
            } catch (error) {
                console.log("Internal Server Error/ Refresh");
            } finally {
                setLoading(false);
            }
        }

        refreshAuth();
    }, [isAuth]);

    const registerUser = async (fname, lname, email, password, confirmPassword, tick) => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/register-user`, {
                fname: fname,
                lname: lname,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
                tick: tick
            }, {
                withCredentials: true
            })
            if (!tick) {
                return { success: true };
            }
            else {
                setUserId(response.data.user._id);
                setAuth(response.data.auth);
                setUsername(`${response.data.user.fname} ${response.data.user.lname}`);
                setUserType('user');
                return { success: true };
            }
        } catch (error) {
            console.error("Error during registration:", error);
            return { success: false, message: "Error creating user!" };
        } finally {
            setLoading(false);
        }
    };

    const loginUser = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/login-user`, {
                email: email,
                password: password
            }, {
                withCredentials: true
            })

            if (response.data.status === 'success') {
                setUserId(response.data.user._id);
                setAuth(response.data.auth);
                setUsername(`${response.data.user.fname} ${response.data.user.lname}`);
                setUserType(response.data.user.userType);
                return { success: true };
            }
            else {
                return { success: false };
            }
        } catch (error) {
            console.error("Error logging in:", error);
            return { success: false, message: "Error logging in!" };
        } finally {
            setLoading(false);
        }
    };

    const logoutUser = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/logout-user`, {}, { withCredentials: true });

            if (response.data.status === 'success') {
                setAuth(false);
                setUserId(null);
                setUsername(null);
                setUserType(null);
                return { success: true };
            } else {
                return { success: false };
            }
        } catch (error) {
            console.error("Error logging out:", error);
            return { success: false, message: "Error logging out!" };
        } finally {
            setLoading(false);
        }
    };


    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${apiUrl}/fetch-users`);
            if (response.data.status === 'success') {
                setUsers(response.data.users);
            }
            else {
                return { success: false };
            }
        } catch (error) {
            console.error("Error fetching non-admin users:", error);
            return { success: false, message: "Error fetching users!" };
        }
    };

    const fetchTelegramUsers = async () => {
        try {
            const response = await axios.get(`${apiUrl}/fetch-telegram-users`);
            if (response.data.status === 'success') {
                setTelegramUsers(response.data.telegramUsers);
                console.log(response.data.telegramUsers);
                return { success: true, telegramUsers: response.data.telegramUsers };
            }
            else {
                return { success: false };
            }
        } catch (error) {
            console.error("Error fetching telegram users:", error);
            return { success: false, message: "Error fetching telegram users!" };
        }
    };


    const updateUser = async (id, firstName, lastName) => {
        setLoading(true);
        try {
            const response = await axios.put(`${apiUrl}/update-user`, {
                fname: firstName,
                lname: lastName,
                userId: id
            })
            if (response.data.status === 'success') {
                return { success: true };
            }
            else {
                return { success: false };
            }
        } catch (error) {
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        setLoading(true);
        try {
            const response = await axios.delete(`${apiUrl}/remove-user`, {
                data: {
                    userId: id
                }
            })
            if (response.data.status === 'success') {
                return { success: true };
            }
        } catch (error) {
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (values) => {
        try {
            setLoading(true);
            const response = await axios.post(`${apiUrl}/create-social-task`, {
                img: values.type,
                priority: values.priority,
                title: values.title,
                link: values.link,
                reward: values.reward
            })

            if (response.data.status === 'success') {
                return { success: true };
            }
            else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return { success: false, message: "Internal Server Error!" };
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${apiUrl}/fetch-social-task`);
            if (response.data.status === 'success') {
                setTasks(response.data.tasks);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
            return { success: false, message: "Error fetching tasks!" };
        }
    };

    const updateTask = async ({ uid, type, priority, title, link, reward }) => {
        try {
            setLoading(true);
            const response = await axios.post(`${apiUrl}/update-social-task/${uid}`, {
                img: type,
                priority: priority,
                title: title,
                link: link,
                reward: reward
            });
            if (response.data.status === 'success') {
                return { success: true };
            }
            else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.log("Error updating task", error);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (uid) => {
        try {
            setLoading(true);
            const response = await axios.delete(`${apiUrl}/delete-task/${uid}`);
            if (response.data.status === "success") {
                console.log("Response", response);
                return { success: true };
            }
            else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return { success: false, message: "Internal Server Error" };
        } finally {
            setLoading(false);
        }
    }

    const createDailyTask = async (values) => {
        try {
            setLoading(true);
            const response = await axios.post(`${apiUrl}/create-daily-task`, {
                img: values.type,
                priority: values.priority,
                title: values.title,
                link: values.link,
                reward: values.reward
            })
            if (response.data.status === 'success') {
                return { success: true };
            }
            else {
                return { success: false };
            }
        } catch (error) {
            return { success: false, message: "Internal Server Error!" };
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyTask = async () => {
        try {
            const response = await axios.get(`${apiUrl}/fetch-daily-task`);
            if (response.data.status === 'success') {
                setDailyTasks(response.data.tasks);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
            return { success: false, message: "Error fetching tasks!" };
        }
    };


    const updateDailyTask = async ({ uid, type, priority, title, link, reward }) => {
        try {
            setLoading(true);

            setLoading(true);
            const response = await axios.post(`${apiUrl}/update-daily-task/${uid}`, {
                img: type,
                priority: priority,
                title: title,
                link: link,
                reward: reward
            });
            if (response.data.status === 'success') {
                return { success: true };
            }
            else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.log("Error updating task", error);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const deleteDailyTask = async (uid) => {
        try {
            setLoading(true);
            const response = await axios.delete(`${apiUrl}/delete-daily/${uid}`);
            if (response.data.status === "success") {
                return { success: true };
            }
            else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return { success: false };
        } finally {
            setLoading(false);
        }
    }

    const fetchAnnoucement = async () => {
        try {
            const response = await axios.get(`${apiUrl}/fetch-annoucements`);
            if(response.data.status === 'success'){
                setAnnoucement(response.data.annoucements);
                return { success: true };
            }
            else{
                return { success: false };
            }
        } catch (error) {
            console.error("Error fetching annoucement:", error);
            return { success: false, message: "Error fetching annoucements!" };
        }
    };

    const updateAnnoucement = async ({ uid, title, subtitle, description, reward, image }) => {
        try {
            setLoading(true);

            // Fetch the existing announcement document
            const announcementDocRef = doc(firestore, 'announcements', uid);
            const announcementSnapshot = await getDoc(announcementDocRef);

            if (!announcementSnapshot.exists()) {
                throw new Error('Announcement not found');
            }

            const announcementData = announcementSnapshot.data();
            let downloadURL = announcementData.image || '';
            let imageName = announcementData.imageName || '';

            // Delete the existing image if a new image is provided
            if (image && announcementData.image) {
                const imageRef = ref(storage, announcementData.image);
                await deleteObject(imageRef); // Delete the existing image
            }

            // Upload the new image if provided
            if (image) {
                const storageRef = ref(storage, `announcements/${Date.now()}_${image.name}`);
                const snapshot = await uploadBytes(storageRef, image);
                downloadURL = await getDownloadURL(snapshot.ref);
                imageName = image.name;
            }

            // Update the announcement document in Firestore
            await updateDoc(announcementDocRef, {
                title: title,
                subtitle: subtitle,
                description: description,
                reward: reward,
                status: false,
                image: downloadURL || null,
                imageName: imageName || null,
            });

            return { success: true };
        } catch (error) {
            console.error("Error updating announcement:", error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const toggleAnnoucementStatus = async (uid, status) => {
        try {
            setLoading(true);

            const response = await axios.post(`${apiUrl}/toggle-annoucement`, {
                id: uid
            })

            if(response.data.status === 'success'){
                return { success: true };
            }
            else{
                return { success: false, message: response.data.message }; 
            }
        } catch (error) {
            console.error("Error updating announcement:", error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };


    const deleteAnnoucement = async (uid) => {
        try {
            setLoading(true);
            const response = await axios.delete(`${apiUrl}/remove-annoucement/${uid}`);
            if(response.data.status === 'success'){
                return { success: true };
            }
            else{
                return { success: false };
            }
        } catch (error) {
            console.error("Error deleting announcement:", error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    /*

    const calculateDashboardMetrics = async () => {
        try {
            // Fetch users data
            const usersCollectionRef = collection(firestore, 'users');
            const usersSnapshot = await getDocs(usersCollectionRef);

            const telegramUsersCollectionRef = collection(firestore, 'telegramUsers');
            const telegramUsersSnapshot = await getDocs(telegramUsersCollectionRef);

            const totalUsers = usersSnapshot.size; // Total number of users
            const totalTelegramUsers = telegramUsersSnapshot.size; // Total number of Telegram users

            const userTypes = {};
            usersSnapshot.forEach((doc) => {
                const userType = doc.data().userType;
                if (userTypes[userType]) {
                    userTypes[userType] += 1;
                } else {
                    userTypes[userType] = 1;
                }
            });

            // Fetch announcements data
            const announcementsCollectionRef = collection(firestore, 'announcements');
            const activeAnnouncementsQuery = query(announcementsCollectionRef, where("status", "==", true));
            const activeAnnouncementsSnapshot = await getDocs(activeAnnouncementsQuery);
            const activeAnnouncements = activeAnnouncementsSnapshot.size;

            // Fetch tasks data
            const tasksCollectionRef = collection(firestore, 'socialTask');
            const tasksSnapshot = await getDocs(tasksCollectionRef);
            const totalTasks = tasksSnapshot.size;

            const tasksByType = {};
            tasksSnapshot.forEach((doc) => {
                const taskType = doc.data().image;
                if (tasksByType[taskType]) {
                    tasksByType[taskType] += 1;
                } else {
                    tasksByType[taskType] = 1;
                }
            });

            const data = {
                totalUsers,
                totalTelegramUsers,
                userTypes,
                activeAnnouncements,
                totalTasks,
                tasksByType
            }
            setMetrics(data);
        } catch (error) {
            console.error("Error calculating dashboard metrics:", error);
            return { success: false, message: "Error calculating metrics" };
        }
    };  */





    return (
        <FirebaseContext.Provider value={{
            registerUser,
            loginUser,
            logoutUser,
            fetchUsers,
            deleteUser,
            fetchTelegramUsers,
            updateUser,
            createTask,
            fetchTasks,
            updateTask,
            deleteTask,
            updateAnnoucement,
            deleteAnnoucement,
            toggleAnnoucementStatus,
            fetchAnnoucement,
            setTelegramUsers,
            telegramUsers,
            setLoading,
            loading,
            userId,
            username,
            isAuth,
            users,
            userType,
            tasks,
            annoucement,
            metrics,
            createDailyTask,
            fetchDailyTask,
            updateDailyTask,
            deleteDailyTask,
            setDailyTasks,
            dailyTasks
        }}>
            {props.children}
        </FirebaseContext.Provider>
    );
};

export default FirebaseContext;
