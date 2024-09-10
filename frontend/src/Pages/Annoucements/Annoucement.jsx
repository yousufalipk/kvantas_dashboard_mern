import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFirebase } from '../../Context/Firebase';

import { RiDeleteBin5Line } from "react-icons/ri";

const Annoucement = () => {
  const navigate = useNavigate();
  const { annoucement, fetchAnnoucement, deleteAnnoucement, toggleAnnoucementStatus } = useFirebase();


  const fetchData = async () => {
    try {
      await fetchAnnoucement();
      console.log("Annoucement", annoucement);
    } catch (error) {
      console.log('Error', error);
    }
  }


  useEffect(() => {
    fetchData();
  }, [])

  const handleCreateAnnoucment = async () => {
    try {
      //Navigate to Create Annoucement
      navigate(`/annoucement-form/${true}`)

    } catch (error) {
      console.log(error);
      toast.error("Internal Server Error")
    }
  }

  const handleUpdateAnnoucment = async (uid, title, subtitle, description, reward, imageName) => {
    try {
      //navigate to update Annoucement
      navigate(`/annoucement-form-update/${false}/${uid}/${title}/${subtitle}/${description}/${reward}/${imageName}`);
    } catch (error) {
      console.log(error);
      toast.error("Internal Server Error")
    }
  }


  const handleDeleteAnnoucement = async (uid, title) => {
    try {
      const shouldDelete = window.confirm(`Are you sure you want remove ${title}?`);
      if (!shouldDelete) {
        return
      }
      else {
        try {
          const response = deleteAnnoucement(uid);
          if (response.data.success) {
            toast.success("Annoucement Deleted Succesfuly!")
          }
          else {
            toast.error("Error Deleting Annoucement!")
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

  const handleStatusToggle = async (uid, title, status) => {
    try {
      const shouldDelete = window.confirm(`Are you sure you want toggle status of ${title}?`);
      if (!shouldDelete) {
        return
      }
      else {
        try {
          const response = await toggleAnnoucementStatus(uid, status);
          if (response.success) {
            setTimeout(() => {
              toast.success("Status Updated Successfuly!");
            }, 1000); 
          }
          else {
            setTimeout(() => {
              toast.error(response.message);
            }, 1000); 
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
      {annoucement && (
        <>
          <div>
            <div className='flex flex-row justify-between'>
              <h1 className='font-bold text-left mx-10 w-full max-w-2xl'>
                Manage Annoucements
              </h1>
              <div className='w-2/4 max-10 flex flex-row justify-end'>
                <button
                  className='mx-2 py-1 px-4 rounded-md bg-bluebtn text-gray-700 hover:bg-transparent hover:border-2 hover:border-bluebtn hover:text-bluebtn'
                  onClick={handleCreateAnnoucment}
                >
                  Add Annoucement
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
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Title</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Subtitle</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Description</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Reward</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Toggle Status</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">File Name</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Thumbnail</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Update</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center' scope="col">Delete</th>
                </tr>
              </thead>
              <tbody>
                {
                  annoucement.map((cls, key) => (
                    <tr key={key}>
                      <th scope="row" className='border-b border-gray-200'>
                        <span style={{ fontWeight: "bold" }}>
                          {key + 1}
                        </span>
                      </th>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        {cls.title}
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        {cls.subtitle}
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        {cls.description}
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        {cls.reward}
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'
                      >
                        <button
                          className="p-2 hover:bg-bluebtn rounded-lg"
                          onClick={() => handleStatusToggle(cls._id, cls.title, cls.status)}
                        >
                          {cls.status ? (<p className='text-green-500 hover:text-black'>Active</p>) : (<p className='text-red-500 hover:text-black'>In Active</p>)}
                        </button>
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        {cls.imageName}
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        <a href={cls.image} target="_blank" rel="noopener noreferrer">
                          <img src={cls.image} alt={"Thumb"} className='w-10 h-10 m-auto' />
                        </a>
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center'>
                        <button
                          className="p-2 rounded-md bg-bluebtn text-gray-700 hover:bg-transparent hover:border-2 hover:border-bluebtn hover:text-bluebtn"
                          onClick={() => handleUpdateAnnoucment(cls._id, cls.title, cls.subtitle, cls.description, cls.reward, cls.imageName)}
                        >
                          Edit
                        </button>
                      </td>
                      <td className='px-6 py-4 border-b border-gray-200 text-sm text-center '>
                        <button
                          className="p-2"
                          onClick={() => handleDeleteAnnoucement(cls._id, cls.title)}
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
      )}
    </>
  )
}

export default Annoucement;
