import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useFirebase } from '../../../Context/Firebase';
import axios from 'axios';

const AnnoucementForm = () => {
    const { updateAnnoucement } = useFirebase();
    const { tick, uid, title, subtitle, description, reward, imageName } = useParams();
    const navigate = useNavigate();

    const apiUrl = process.env.REACT_APP_API_URL;

    const initialValues = {
        title: title || '',
        subtitle: subtitle || '',
        description: description || '',
        reward: reward || '',
        image: imageName || ''
    };

    const validationSchema = Yup.object({
        title: Yup.string().required('Title is required'),
        subtitle: Yup.string().required('Subtitle is required'),
        description: Yup.string().required('Description is required'),
        reward: Yup.number().required('Reward is required'),
        image: Yup.mixed()
            .required('Image is required')
            .test('fileSize', 'File size too large', value => !value || (value && value.size <= 2 * 1024 * 1024)) // 2 MB limit
            .test('fileType', 'Unsupported file format', value => !value || ['image/jpeg', 'image/png'].includes(value.type))  // Accepts only JPEG and PNG
    });

    const formik = useFormik({
        initialValues,
        validationSchema: validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                if (tick === 'true') {
                    console.log("Creating...");
    
                    // Create Announcement
                    const formData = new FormData();
                    formData.append('title', values.title);
                    formData.append('subtitle', values.subtitle);
                    formData.append('description', values.description);
                    formData.append('reward', values.reward);
                    formData.append('status', false); // Assuming 'status' is required
                    if (values.image) {
                        formData.append('image', values.image);
                    }
                    formData.append('imageName', values.image.name);
    
                    const response = await axios.post(`${apiUrl}/create-annoucement`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
    
                    if (response.data.message === 'Announcement created successfully!') {
                        navigate('/annoucements');
                        toast.success("Announcement Created Successfully!");
                    } else {
                        toast.error("Error Creating Announcement!");
                    }
                } else {
                    console.log("Updating...");
    
                    // Update Announcement
                    const updateData = {
                        title: values.title,
                        subtitle: values.subtitle,
                        description: values.description,
                        reward: values.reward,
                    };
                    
                    // Include image as a string if it exists
                    if (values.image) {
                        updateData.image = values.image.name; 
                    }                    
    
                    const response = await axios.put(`${apiUrl}/update-annoucement`,{
                        id: uid,
                        updateData
                    });
                    console.log("Frontend",response.data);
                    if (response.data.message === 'Announcement updated successfully!') {
                        navigate('/annoucements');
                        toast.success("Announcement Updated Successfully!");
                    } else {
                        toast.error("Error Updating Announcement!");
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error("Internal Server Error");
            } finally {
                resetForm(); // Clear form data
            }
        }
    });
    


    const handleBack = () => {
        navigate('/annoucements');
    };

    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        formik.setFieldValue('image', file);
    };

    return (
        <div className='p-4'>
            <div className='flex flex-row justify-between items-center mb-5'>
                <h1 className='font-bold text-left text-xl'>
                    {tick === 'true' ? 'Add Announcement' : 'Edit Announcement'}
                </h1>
                <div className='flex'>
                    <button
                        className='mx-2 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600'
                        onClick={handleBack}
                    >
                        Back
                    </button>
                    <button
                        className='mx-2 py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600'
                        type='submit'
                        onClick={formik.handleSubmit}
                    >
                        {tick === 'true' ? 'Create Announcement' : 'Confirm Changes'}
                    </button>
                </div>
            </div>
            <hr className='my-5 border-gray-300' />
            <form onSubmit={formik.handleSubmit} className='flex flex-col w-3/4 max-w-md mx-auto'>
                <input
                    className='p-3 mx-2 my-3 border-2 rounded-xl placeholder:text-gray-700 text-gray-700'
                    type='text'
                    id='title'
                    name='title'
                    placeholder='Title'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.title}
                />
                {formik.touched.title && formik.errors.title ? (
                    <div className='text-red-600 text-center'>{formik.errors.title}</div>
                ) : null}

                <input
                    className='p-3 mx-2 my-3 border-2 rounded-xl placeholder:text-gray-700 text-gray-700'
                    type='text'
                    id='subtitle'
                    name='subtitle'
                    placeholder='Sub Title'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.subtitle}
                />
                {formik.touched.subtitle && formik.errors.subtitle ? (
                    <div className='text-red-600 text-center'>{formik.errors.subtitle}</div>
                ) : null}

                <input
                    className='p-3 mx-2 my-3 border-2 rounded-xl placeholder:text-gray-700 text-gray-700'
                    type='text'
                    id='description'
                    name='description'
                    placeholder='Description'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.description}
                />
                {formik.touched.description && formik.errors.description ? (
                    <div className='text-red-600 text-center'>{formik.errors.description}</div>
                ) : null}

                <input
                    className='p-3 mx-2 my-3 border-2 rounded-xl placeholder:text-gray-700 text-gray-700'
                    type='number'
                    id='reward'
                    name='reward'
                    placeholder='Reward'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.reward}
                />
                {formik.touched.reward && formik.errors.reward ? (
                    <div className='text-red-600 text-center'>{formik.errors.reward}</div>
                ) : null}

                <input
                    className='p-3 mx-2 my-3 border-2 rounded-xl placeholder:text-gray-700 text-gray-700 bg-white'
                    type='file'
                    id='image'
                    name='image'
                    onChange={handleFileChange}
                />
                {formik.touched.image && formik.errors.image ? (
                    <div className='text-red-600 text-center'>{formik.errors.image}</div>
                ) : null}

            </form>
        </div>
    );
};

export default AnnoucementForm;
