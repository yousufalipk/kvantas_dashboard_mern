import React, { useEffect, useState } from 'react';
import { useFirebase } from '../../Context/Firebase';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const ManageTelegramUsers = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { telegramUsers, fetchTelegramUsers, setLoading } = useFirebase();
  const [filter, setFilter] = useState('balance');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const response = await fetchTelegramUsers();
      console.log("Response: ", response);
    } catch (error) {
      console.log('Error', error);
    }
  };

  const handleDownloadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/downloadTeleUsersData`, {
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'TelegramUserdata.xlsx';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) {
          filename = match[1];
        }
      }

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      saveAs(blob, filename);
      toast.success("Data Downloaded Successfully!");
    } catch (error) {
      toast.error("Error Downloading Data!");
      console.error('Error downloading the file:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (timestamp) => {
    if (timestamp) {
      const date = new Date(timestamp);
      const formattedDate = format(date, 'MM/dd/yyyy');
      const formattedTime = format(date, 'hh:mm a');
      return `${formattedDate}\n${formattedTime}`;
    }
    return 'Invalid Date';
  };
  

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const sortUsers = (users) => {
    if (filter === 'balance') {
      return users.sort((a, b) => b.balance - a.balance);
    } else if (filter === 'a-z') {
      return users.sort((a, b) => a.username.localeCompare(b.username));
    }
    return users;
  };

  // Pagination Logic
  const totalPages = Math.ceil(telegramUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = sortUsers(telegramUsers).slice(startIndex, endIndex);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {telegramUsers ? (
        <>
          <div>
            <div className='flex flex-row justify-between'>
              <h1 className='font-bold text-left mx-10 w-full max-w-2xl'>
                Manage Telegram Users
              </h1>
              <div className='w-2/4 max-10 flex flex-row justify-end items-center'>
                <select
                  className='mx-2 py-1 px-4 rounded-md bg-gray-200 text-gray-900 border-none'
                  value={filter}
                  onChange={handleFilterChange}
                >
                  <option value="balance">Balance</option>
                  <option value="a-z">A-Z</option>
                </select>
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
            <table className="bg-transparent border-collapse border border-gray-200 w-full table-fixed">
              <thead className="thead-dark">
                <tr>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center w-1/6' scope="col">Telegram Id</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center w-1/6' scope="col">Date of Joining</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center w-1/6' scope="col">Username</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center w-1/6' scope="col">First Name</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center w-1/6' scope="col">Last Name</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center w-1/6' scope="col">Wallet Address</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center w-1/6' scope="col">Twitter Username</th>
                  <th className='px-6 py-3 border-b-2 border-gray-300 text-sm text-center w-1/6' scope="col">Balance</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((cls, key) => (
                  <tr key={key}>
                    <th scope="row" className='border-b border-gray-200 w-1/6'>
                      <span style={{ fontWeight: "bold", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {cls.userId || "undefined"}
                      </span>
                    </th>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-center w-1/6" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "pre-line" }}>
                      {formatDate(cls.createdAt) || "undefined"}
                    </td>
                    <td className='px-6 py-4 border-b border-gray-200 text-sm text-center w-1/6' style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {cls.username || "undefined"}
                    </td>
                    <td className='px-6 py-4 border-b border-gray-200 text-sm text-center w-1/6' style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {cls.firstName || "undefined"}
                    </td>
                    <td className='px-6 py-4 border-b border-gray-200 text-sm text-center w-1/6' style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {cls.lastName || "undefined"}
                    </td>
                    <td className='px-6 py-4 border-b border-gray-200 text-sm text-center w-1/6' style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {cls.tonWalletAddress || "undefined"}
                    </td>
                    <td className='px-6 py-4 border-b border-gray-200 text-sm text-center w-1/6' style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {cls.twitterUserName || "undefined"}
                    </td>
                    <td className='px-6 py-4 border-b border-gray-200 text-sm text-center w-1/6' style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {cls.balance || "undefined"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className='flex mt-5'>
              <div className='my-5 w-1/2'> 
                {/* Buttons */}
                <Stack spacing={2} className='text-white'>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    shape="rounded"
                    onChange={handlePageChange}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'white',
                      },
                      '& .MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: '#1E40AF', 
                        color: 'white', 
                      },
                      '& .MuiPaginationItem-root:hover': {
                        backgroundColor: '#fff !important',
                        color: '#000 !important',
                      },
                    }}
                  />
                </Stack>
              </div>
            <div className='my-5 w-1/2 text-white text-end'> 
                {/* Page of Pages  */}
                  Page {currentPage} of {totalPages}
            </div>
            </div>
          </div>
        </>
      ) : (
        <div className='flex justify-center items-center py-64 font-semibold italic text-2xl'>Loading...</div>
      )}
    </>
  );
}

export default ManageTelegramUsers;
