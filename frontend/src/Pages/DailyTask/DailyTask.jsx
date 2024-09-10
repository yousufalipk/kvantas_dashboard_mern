import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../Context/Firebase';

import { RiDeleteBin5Line } from "react-icons/ri";

const DailyTask = () => {
    const navigate = useNavigate();
    const { dailyTasks, fetchDailyTask, deleteDailyTask } = useFirebase();

    const fetchData = async () => {
        try {
            await fetchDailyTask();
            console.log("Tasks", dailyTasks);
        } catch (error) {
            console.log('Error', error);
        }
    }


    useEffect(() => {
        fetchData();
    }, [])


    const handleCreateTask = async () => {
        try {
            //Navigate to Create form
            navigate(`/daily-tasks-form/${true}`)
        } catch (error) {
            console.log(error);
            toast.error("Internal Server Error")
        }
    }

    const handleUpdateTask = async (uid, type, priority, title, link, reward) => {
        try {
            //navigate to update user
            const encodedLink = encodeURIComponent(link);
            navigate(`/daily-tasks-form-update/${false}/${uid}/${priority}/${type}/${title}/${reward}/${encodedLink}`);
        } catch (error) {
            console.log(error);
            toast.error("Internal Server Error")
        }
    }

    const handleDeleteTask = async (uid, title) => {
        try {
            const shouldDelete = window.confirm(`Are you sure you want remove ${title}?`);
            if (!shouldDelete) {
                return
            }
            else {
                try {
                    const response = await deleteDailyTask(uid);
                    if (response.success) {
                        setTimeout(()=> {
                            toast.success("Task Deleted Succesfuly!")
                        }, 500)
                    }
                    else {
                        setTimeout(()=> {
                            toast.error("Error Deleting Task!")
                        }, 500)
                    }
                } catch (error) {
                    toast.error("Internal Server Error!")
                }
            }

        } catch (error) {
            console.log(error);
            toast.error("Internal Server Error")
        }
    }

    return (
        <>
            <div>
                <div className='flex flex-row justify-between'>
                    <h1 className='font-bold text-left mx-10 w-full max-w-2xl'>
                        Daily Task
                    </h1>
                    <div className='w-2/4 max-10 flex flex-row justify-end'>
                        <button
                            className='mx-2 py-1 px-4 rounded-md bg-bluebtn text-gray-700 hover:bg-transparent hover:border-2 hover:border-bluebtn hover:text-bluebtn'
                            onClick={handleCreateTask}
                        >
                            Add Task
                        </button>
                    </div>
                </div>
                <hr className='my-5 border-1 border-[white] mx-2' />
            </div>
            <div className='mx-2 my-10'>
                <table className="min-w-full bg-transparent border-collapse border border-gray-200">
                    <thead className="thead-dark">
                        <tr>
                            <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Priority</th>
                            <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Type</th>
                            <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Title</th>
                            <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Link</th>
                            <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Reward</th>
                            <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Update</th>
                            <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            dailyTasks
                                .sort((a, b) => a.priority - b.priority)
                                .map((cls, key) => (
                                    <tr key={key}>
                                        <th scope="row" className='border-b border-gray-200'>
                                            <span style={{ fontWeight: "bold" }}>
                                                {cls.priority}
                                            </span>
                                        </th>
                                        <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                                            {cls.image}
                                        </td>
                                        <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                                            {cls.title}
                                        </td>
                                        <td
                                            className='px-6 py-4 border-b border-gray-200 text-sm text-center cursor-pointer hover:text-bluebtn'
                                            onClick={() => window.open(`https://${cls.link}`, '_blank')}
                                        >
                                            {cls.link}
                                        </td>
                                        <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                                            {cls.reward}
                                        </td>
                                        <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                                            <button
                                                className="p-2 rounded-md bg-bluebtn text-gray-700 hover:bg-transparent hover:border-2 hover:border-bluebtn hover:text-bluebtn"
                                                onClick={() => handleUpdateTask(cls._id, cls.image, cls.priority, cls.title, cls.link, cls.reward)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                        <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                                            <button
                                                className="p-2"
                                                onClick={() => handleDeleteTask(cls._id, cls.title)}
                                            >
                                                <RiDeleteBin5Line className="text-bluebtn w-5 h-5 hover:text-gray-700" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default DailyTask;