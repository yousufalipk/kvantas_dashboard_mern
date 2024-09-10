import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../Context/Firebase';

const LoginForm = () => {
    const { loginUser } = useFirebase();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            password: Yup.string()
                .min(6, 'Password must be at least 6 characters')
                .required('Password is required')
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                const response = await loginUser(values.email, values.password);
                if(response.success){
                    toast.success("Logged In Successfuly!")
                    navigate('/admin');
                }
                else{
                    toast.error('Invalid Credentials!');
                }
            } catch (error) {
                console.log(error);
                toast.error('Internal Server Error!');
            }

            resetForm(); // Clear form data
        }
    });

    return (
        <div>
            <h3 className='text-2xl mx-2 font-bold text-white'>Welcome!</h3>
            <h2 className='text-2xl mx-2 text-white'>Sign into your account</h2>
            <form onSubmit={formik.handleSubmit} className='flex flex-col'>
                <input className='p-3 mx-2 my-3 border-2 rounded-xl placeholder:text-gray-700 text-gray-700'
                    type='text'
                    id='email'
                    name='email'
                    autoComplete="email"
                    placeholder='Email'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                    <div className='text-red-600 text-center'>{formik.errors.email}</div>
                ) : null}

                <input className='p-3 mx-2 my-2 border-2 rounded-xl placeholder:text-gray-700 text-gray-700'
                    type='password'
                    id='password'
                    name='password'
                    placeholder='Password'
                    autoComplete="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                />
                {formik.touched.password && formik.errors.password ? (
                    <div className='text-red-600 text-center'>{formik.errors.password}</div>
                ) : null}

                <button type='submit' className='w-28 p-3 mx-2 my-1 rounded-md bg-bluebtn text-gray-700 hover:bg-transparent hover:border-2 hover:border-bluebtn hover:text-bluebtn'>
                    Sign In
                </button>
            </form>
        </div>
    );
};

export default LoginForm;