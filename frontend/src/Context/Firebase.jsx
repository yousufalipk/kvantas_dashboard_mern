import React, { createContext, useContext, useState, useEffect } from "react";
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


    // Function to refresh auth state on page load/refresh
    useEffect(() => {
        setLoading(true);
        calculateDashboardMetrics();
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                const uid = user.uid;
                setUserId(uid);
                setAuth(true);

                const userRef = doc(firestore, 'users', uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUsername(`${userData.fname} ${userData.lname}`);
                    setUserType(userData.userType);
                }
            } else {
                // Clear the data if the user is not authenticated
                setAuth(false);
                setUsername(null);
                setUserId(null);
                setUserType(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);


    const registerUser = async (fname, lname, email, password, tick) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            const user = userCredential.user;
            const uid = user.uid;

            // Store additional user information in Firestore
            await setDoc(doc(firestore, 'users', uid), {
                fname: fname,
                lname: lname,
                email: email,
                userType: 'user'
            });

            if (tick) {
                return { success: true };
            }
            else {
                setUserId(uid);
                setAuth(true);
                setUsername(`${fname} ${lname}`);
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
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            const user = userCredential.user;
            const uid = user.uid;

            setUserId(uid);
            setAuth(true);

            const userRef = doc(firestore, 'users', uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                setUsername(`${userData.fname} ${userData.lname}`);
                setUserType(userData.userType);
                return { success: true };
            } else {
                return { success: false, message: "No such document!" };
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
            await signOut(firebaseAuth);
            setAuth(false);
            setUsername(null);
            setUserId(null);
            setUserType(null);
            return { success: true };
        } catch (error) {
            console.error("Error during logout:", error);
            return { success: false, message: "Error logging out!" };
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const usersQuery = query(collection(firestore, 'users'), where('userType', '!=', 'admin'));
            const querySnapshot = await getDocs(usersQuery);
            const nonAdminUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(nonAdminUsers);
            return { success: true };
        } catch (error) {
            console.error("Error fetching non-admin users:", error);
            return { success: false, message: "Error fetching users!" };
        }
    };

    const fetchTelegramUsers = async () => {
        try {
            const telegramUsersQuery = query(collection(firestore, 'telegramUsers'));
            const telegramUsersSnapshot = await getDocs(telegramUsersQuery);
            const telegramUsers = telegramUsersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTelegramUsers(telegramUsers);
            return { success: true, telegramUsers: telegramUsers };
        } catch (error) {
            console.error("Error fetching telegram users:", error);
            return { success: false, message: "Error fetching telegram users!" };
        }
    };


    const updateUser = async (id, firstName, lastName) => {
        setLoading(true);
        try {
            await updateDoc(doc(firestore, 'users', id), {
                fname: firstName,
                lname: lastName
            });
            return { success: true };
        } catch (error) {
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (values) => {
        try {
            setLoading(true);
            // Reference to the tasks collection
            const tasksCollection = collection(firestore, 'socialTask');

            // Check if the priority is already taken
            const snapshot = await getDocs(query(tasksCollection, where("priority", "==", values.priority)));
            if (!snapshot.empty) {
                console.log("Priority taken");
                return { success: false, message: "Priority is already taken!" };
            }

            // Add a new document to the tasks collection
            await addDoc(tasksCollection, {
                image: values.type,
                priority: values.priority,
                title: values.title,
                link: values.link,
                reward: values.reward,
                createdAt: new Date()
            });

            return { success: true };
        } catch (error) {
            return { success: false, message: "Internal Server Error!" };
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const tasksRef = collection(firestore, 'socialTask');
            // Create a query that orders tasks by priority in ascending order
            const q = query(tasksRef, orderBy("priority", "asc"));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { success: false, message: 'No tasks found!' };
            }

            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setTasks(tasksData); // Store the sorted tasks
            return { success: true };
        } catch (error) {
            console.error("Error fetching tasks:", error);
            return { success: false, message: "Error fetching tasks!" };
        }
    };


    const updateTask = async ({ uid, type, priority, title, link, reward }) => {
        try {
            setLoading(true);

            // Check if the priority is already taken by another task
            const tasksCollection = collection(firestore, 'socialTask');
            const snapshot = await getDocs(query(tasksCollection, where("priority", "==", priority)));
            if (!snapshot.empty && snapshot.docs[0].id !== uid) {
                console.log("Priority taken");
                return { success: false, message: "Priority is already taken!" };
            }

            // Update the task if the priority is available
            await updateDoc(doc(firestore, 'socialTask', uid), {
                image: type,
                priority,
                title,
                link,
                reward,
                createdAt: new Date()
            });

            return { success: true };
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
            await deleteDoc(doc(firestore, 'socialTask', uid));
            return { success: true };
        } catch (error) {
            return { success: false };
        } finally {
            setLoading(false);
        }
    }


    const createDailyTask = async (values) => {
        try {
            setLoading(true);
            // Reference to the tasks collection
            const tasksCollection = collection(firestore, 'dailyTask');

            // Check if the priority is already taken
            const snapshot = await getDocs(query(tasksCollection, where("priority", "==", values.priority)));
            if (!snapshot.empty) {
                console.log("Priority taken");
                return { success: false, message: "Priority is already taken!" };
            }

            // Add a new document to the tasks collection
            await addDoc(tasksCollection, {
                image: values.type,
                priority: values.priority,
                title: values.title,
                link: values.link,
                reward: values.reward,
                createdAt: new Date()
            });

            return { success: true };
        } catch (error) {
            return { success: false, message: "Internal Server Error!" };
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyTask = async () => {
        try {
            console.log("Fetching data!")
            const tasksRef = collection(firestore, 'dailyTask');
            // Create a query that orders tasks by priority in ascending order
            const q = query(tasksRef, orderBy("priority", "asc"));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log("Empty!")
                return { success: false, message: 'No tasks found!' };
            }

            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setDailyTasks(tasksData); // Store the sorted tasks
            return { success: true };
        } catch (error) {
            console.error("Error fetching tasks:", error);
            return { success: false, message: "Error fetching tasks!" };
        }
    };


    const updateDailyTask = async ({ uid, type, priority, title, link, reward }) => {
        try {
            setLoading(true);

            // Check if the priority is already taken by another task
            const tasksCollection = collection(firestore, 'dailyTask');
            const snapshot = await getDocs(query(tasksCollection, where("priority", "==", priority)));
            if (!snapshot.empty && snapshot.docs[0].id !== uid) {
                console.log("Priority taken");
                return { success: false, message: "Priority is already taken!" };
            }

            // Update the task if the priority is available
            await updateDoc(doc(firestore, 'dailyTask', uid), {
                image: type,
                priority,
                title,
                link,
                reward,
                createdAt: new Date()
            });

            return { success: true };
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
            await deleteDoc(doc(firestore, 'dailyTask', uid));
            return { success: true };
        } catch (error) {
            return { success: false };
        } finally {
            setLoading(false);
        }
    }

    const createAnnoucement = async (values) => {
        try {
            setLoading(true);

            let downloadURL = '';

            if (values.image) {
                const storageRef = ref(storage, `announcements/${Date.now()}_${values.image.name}`);

                const snapshot = await uploadBytes(storageRef, values.image);

                downloadURL = await getDownloadURL(snapshot.ref);
            }

            // Add the announcement to Firestore
            const annoucementCollection = collection(firestore, 'announcements');

            await addDoc(annoucementCollection, {
                title: values.title,
                subtitle: values.subtitle,
                description: values.description,
                reward: values.reward,
                status: false,
                image: downloadURL || null,
                imageName: values.image.name || null
            });

            return { success: true };
        } catch (error) {
            console.error("Error creating announcement:", error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const fetchAnnoucement = async () => {
        try {
            const tasksRef = collection(firestore, 'announcements');
            const snapshot = await getDocs(tasksRef);
            if (snapshot.empty) {
                return { success: false, message: 'No annoucements found!' };
            }

            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAnnoucement(tasksData);
            return { success: true };
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
            console.log("Status", status, "Uid", uid);
            setLoading(true);
    
            // Fetch the existing announcement document
            const announcementDocRef = doc(firestore, 'announcements', uid);
    
            // Check if there's another active announcement
            const activeAnnouncementQuery = query(collection(firestore, 'announcements'), where('status', '==', true));
            const activeAnnouncementSnapshot = await getDocs(activeAnnouncementQuery);
    
            if (activeAnnouncementSnapshot.size > 0 && !status) {
                // If there is another active announcement, return a message
                console.log("Another Annoucement is already active!");
                return { success: false, message: "Another announcement is already active!" };
            }
    
            // Update the announcement document in Firestore
            await updateDoc(announcementDocRef, {
                status: !status
            });
    
            return { success: true };
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

            const announcementDoc = await getDoc(doc(firestore, 'announcements', uid));

            if (announcementDoc.exists()) {
                const announcementData = announcementDoc.data();
                const imagePath = announcementData.image;

                await deleteDoc(doc(firestore, 'announcements', uid));

                if (imagePath) {
                    const imageRef = ref(storage, imagePath);
                    await deleteObject(imageRef);
                }
            }

            return { success: true };
        } catch (error) {
            console.error("Error deleting announcement:", error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

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
    };


    


    return (
        <FirebaseContext.Provider value={{
            registerUser,
            loginUser,
            logoutUser,
            fetchUsers,
            fetchTelegramUsers,
            updateUser,
            createTask,
            fetchTasks,
            updateTask,
            deleteTask,
            createAnnoucement,
            fetchAnnoucement,
            updateAnnoucement,
            deleteAnnoucement,
            toggleAnnoucementStatus,
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
