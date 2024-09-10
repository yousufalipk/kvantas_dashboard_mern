import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useFirebase } from '../../../Context/Firebase';

const UpdateUserForm = () => {
  const { updateUser } = useFirebase();
  const navigate = useNavigate();
  const { userId, fname, lname, email } = useParams();

  const handleBack = () => {
    navigate('/manage-users');
  };

  const formik = useFormik({
    initialValues: {
      fname: fname || '',
      lname: lname || ''
    },
    validationSchema: Yup.object({
      fname: Yup.string()
        .required('First Name is required'),
      lname: Yup.string()
        .required('Last Name is required')
    }),
    onSubmit: async (values, { resetForm }) => {
      const shouldUpdate = window.confirm(`Are you sure you want to update ${email}?`);
      if (shouldUpdate) {
        try {
          const response = await updateUser(userId, values.fname, values.lname);
          console.log("RESPONSE", response.success);
          if (response.success) {
            setTimeout(()=> {
              toast.success("Info Updated Successfully!");
            },500)
            navigate('/manage-users');
          } else {
            setTimeout(()=> {
              toast.error("Updating info failed!");
            })
          }
        } catch (error) {
          console.error("Error", error);
          toast.error("Internal Server Error!");
        } finally {
          resetForm(); // Clears Form
        }
      }
    }
  });

  return (
    <>
      <div className='flex flex-row justify-between'>
        <h1 className='font-bold text-left mx-10 w-full max-w-2xl'>
          Update User (<span className='text-bluebtn'>{email}</span>)
        </h1>
        <div className='w-2/4 max-w-10 flex flex-row justify-end'>
          <button
            className='mx-2 bg-red-500 text-white py-1 px-4 rounded-md hover:bg-transparent hover:border-2 hover:border-red-500 hover:text-red-500'
            onClick={handleBack}
          >
            Back
          </button>
          <button
            type='submit'
            className='mx-2 py-1 px-4 rounded-md bg-bluebtn text-gray-700 hover:bg-transparent hover:border-2 hover:border-bluebtn hover:text-bluebtn'
            onClick={formik.handleSubmit}
          >
            Update
          </button>
        </div>
      </div>
      <hr className='my-5 border-1 border-white mx-2' />
      <div className='h-4/5 flex flex-col justify-center items-center'>
        <form className='flex flex-col w-full' onSubmit={formik.handleSubmit}>
          <label htmlFor='fname' className='w-2/4 mx-auto px-5 font-semibold'>First Name</label>
          <input 
            className='p-3 my-3 border-2 rounded-xl w-2/4 mx-auto placeholder:text-gray-700 text-gray-700'
            type='text'
            id='fname'
            name='fname'
            autoComplete='given-name'
            placeholder='First Name'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.fname}
          />
          {formik.touched.fname && formik.errors.fname ? (
            <div className='text-red-600 text-center'>{formik.errors.fname}</div>
          ) : null}

          <label htmlFor='lname' className='w-2/4 mx-auto px-5 font-semibold'>Last Name</label>
          <input 
            className='p-3 my-2 border-2 rounded-xl w-2/4 mx-auto placeholder:text-gray-700 text-gray-700'
            type='text'
            id='lname'
            name='lname'
            placeholder='Last Name'
            autoComplete='family-name'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.lname}
          />
          {formik.touched.lname && formik.errors.lname ? (
            <div className='text-red-600 text-center'>{formik.errors.lname}</div>
          ) : null}
        </form>
      </div>
    </>
  );
};

export default UpdateUserForm;
