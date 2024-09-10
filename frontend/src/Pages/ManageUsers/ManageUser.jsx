import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../Context/Firebase';
import axios from 'axios';
import { saveAs } from 'file-saver';

import { RiDeleteBin5Line } from "react-icons/ri";

const ManageUser = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { users, fetchUsers, setLoading, deleteUser } = useFirebase();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      await fetchUsers();
    } catch (error) {
      console.log('Error', error);
    } finally {
    }
  }


  useEffect(() => {
    fetchData();
  }, [])


  const handleDeleteUser = async (id, email) => {
    const shouldDelete = window.confirm(`Are you sure you want remove ${email}?`);
    if (!shouldDelete) {
      return
    }
    else {
      try {
        setLoading(true);
        const response = await deleteUser(id);
        if (response.success) {
          fetchData();
          toast.success(response.data.message);
        }
        else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Internal Server Error!")
      } finally {
        setLoading(false);
      }
    }
  }

  const handleUpdateUser = (id, fname, lname, email) => {
    navigate(`/update-user/${id}/${fname}/${lname}/${email}`);
  }

  const handleAddUser = () => {
    navigate(`/add-user`);
  }

  const handleDownloadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/downloadUsersData`, {
        responseType: 'blob',
      });

      // Extract the filename from the headers if needed
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'userdata.xlsx';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) {
          filename = match[1];
        }
      }

      // Use FileSaver to save the file
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      saveAs(blob, filename);
      toast.success("Data Downloaded Successfuly!")
    } catch (error) {
      toast.error("Error Downloading Data!")
      console.error('Error downloading the file:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {users ? (
        <>
          <div>
            <div className='flex flex-row justify-between'>
              <h1 className='font-bold text-left mx-10 w-full max-w-2xl'>
                Manage Users
              </h1>
              <div className='w-2/4 max-10 flex flex-row justify-end'>
                <button
                  className='mx-2 py-1 px-4 rounded-md bg-bluebtn text-gray-700 hover:bg-transparent hover:border-2 hover:border-bluebtn hover:text-bluebtn'
                  onClick={handleAddUser}
                >
                  Add User
                </button>
                <button
                  className='mx-2 py-1 px-4 rounded-md bg-blue-800 text-white hover:bg-transparent hover:border-2 hover:border-blue-800 hover:text-blue-800'
                  onClick={handleDownloadData}
                >
                  Download User Data
                </button>


              </div>
            </div>
            <hr className='my-5 border-1 border-[white] mx-2' />
          </div>
          <div className='mx-2 my-10'>
            <table className="min-w-full bg-transparent border-collapse border border-gray-200">
              <thead className="thead-dark">
                <tr>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Sr.No</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">First Name</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Last Name</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Email</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Update</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Delete</th>
                </tr>
              </thead>
              <tbody>
                {
                  users.map((cls, key) => (
                    <tr key={key}>
                      <th scope="row" className='border-b border-gray-200'>
                        <span style={{ fontWeight: "bold" }}>
                          {key + 1}
                        </span>
                      </th>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        {cls.fname}
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        {cls.lname}
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        {cls.email}
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        <button
                          className="p-2 rounded-md bg-bluebtn text-gray-700 hover:bg-transparent hover:border-2 hover:border-bluebtn hover:text-bluebtn"
                          onClick={() => handleUpdateUser(cls._id, cls.fname, cls.lname, cls.email)}
                        >
                          Update
                        </button>
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center '>
                        <button
                          className="p-2"
                          onClick={() => handleDeleteUser(cls._id, cls.email)}
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
      ) : (
        <>
          <div className='flex justify-center items-center py-64 font-semibold italic text-2xl'> Loading...</div>
        </>
      )}
    </>
  )
}

export default ManageUser;
