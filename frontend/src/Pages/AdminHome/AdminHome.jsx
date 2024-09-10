import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../Context/Firebase';

const AdminHome = () => {
    const { metrics } = useFirebase();

    return (
        <>
            {metrics ? (
                <>
                    <div>
                        Admin Dashboard
                        <hr className='my-5 border-1 border-white mx-2' />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Users */}
                        <div
                            className="flex flex-col gap-2 h-40 text-white rounded-xl shadow-md p-6 max-w-[240px] bg-blue-900 bg-opacity-30 backdrop-filter backdrop-blur-lg">
                            <div className="font-semibold text-lg">Total Users</div>
                            <div className="font-thin text-md tracking-tight">{metrics.totalUsers}</div>
                        </div>
                        {/* User Type */}
                        <div
                            className="flex flex-col gap-2 h-40 text-white rounded-xl shadow-md p-6 max-w-[240px] bg-blue-900 bg-opacity-30 backdrop-filter backdrop-blur-lg">
                            <div className="font-semibold text-lg">User Type</div>
                            <div className="font-thin text-md tracking-tight">Users {metrics.userTypes.user}</div>
                            <div className="font-thin text-md tracking-tight">Admins {metrics.userTypes.admin}</div>
                        </div>
                        {/* Telegram Users */}
                        <div
                            className="flex flex-col gap-2 h-40 text-white rounded-xl shadow-md p-6 max-w-[240px] bg-blue-900 bg-opacity-30 backdrop-filter backdrop-blur-lg">
                            <div className="font-semibold text-lg">Telegram Users</div>
                            <div className="font-thin text-md tracking-tight">{metrics.totalTelegramUsers}</div>
                        </div>
                        {/* Active Announcements */}
                        <div
                            className="flex flex-col gap-2 h-40 text-white rounded-xl shadow-md p-6 max-w-[240px] bg-blue-900 bg-opacity-30 backdrop-filter backdrop-blur-lg">
                            <div className="font-semibold text-lg">Active Announcements</div>
                            <div className="font-thin text-md tracking-tight">{metrics.activeAnnouncements}</div>
                        </div>
                    </div>

                    {/* Task By Type Card */}
                    <div className="mt-6 flex flex-col gap-2 text-white rounded-xl shadow-md p-6 bg-blue-900 bg-opacity-30 backdrop-filter backdrop-blur-lg mr-5">
                        <div className="font-semibold text-lg">Task By Type</div>
                        <div className="flex flex-row justify-between">
                            {/* Tasks C1 */}
                            <div className="flex-1 text-center">
                                <div className="font-thin text-md tracking-tight m-2">Instagram {metrics.tasksByType.instagram}</div>
                                <div className="font-thin text-md tracking-tight m-2">Youtube {metrics.tasksByType.youtube}</div>
                            </div>
                            {/* Tasks C2 */}
                            <div className="flex-1 text-center">
                                <div className="font-thin text-md tracking-tight m-2">Website {metrics.tasksByType.moreLink}</div>
                                <div className="font-thin text-md tracking-tight m-2">Twitter {metrics.tasksByType.twitter}</div>
                            </div>
                            {/* Tasks C3 */}
                            <div className="flex-1 text-center">
                                <div className="font-thin text-md tracking-tight m-2">Telegram {metrics.tasksByType.telegram}</div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className='flex justify-center items-center py-64 font-semibold italic text-2xl'> Loading...</div>
                </>
            )}
        </>
    );
};

export default AdminHome;
