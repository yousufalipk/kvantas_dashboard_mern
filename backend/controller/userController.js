const UserModel = require('../Models/userSchema');
const SocialModel = require('../Models/socialSchema');
const DailyModel = require('../Models/dailySchema');
const TelegramModel = require('../Models/telegramSchema');
const AnnouncementModel = require('../Models/annoucementSchema'); 
const RefreshTokenModel = require("../Models/tokenSchema");

const bcrypt = require('bcrypt');
const XLSX = require('xlsx');
const JWTService = require('../Services/JWTService');
const { upload, storage } = require('../utils/imageUpload');

exports.createUser = async (req, res) => {
    try {
        const { fname, lname, email, password, confirmPassword, tick } = req.body;

        const alreadyUser = await UserModel.findOne({ email: email });

        if (alreadyUser) {
            return res.status(200).json({
                status: 'failed',
                message: "Account Already Created!"
            })
        }

        if (password !== confirmPassword) {
            return res.status(200).json({
                status: 'failed',
                message: "Password did't match!"
            })
        }

        // Hashing Password before saving
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserModel({
            fname: fname,
            lname: lname,
            email: email,
            password: hashedPassword,
            userType: 'user'
        })

        if (tick) {
            // Token Generation 
            let accessToken, refreshToken;

            accessToken = JWTService.signAccessToken({ _id: newUser._id, email: newUser.email }, '30m');
            refreshToken = JWTService.signRefreshToken({ _id: newUser._id }, '60m');

            const newRefreshToken = new RefreshTokenModel({
                token: refreshToken,
                userId: newUser._id
            })

            //Save Refresh Token
            await newRefreshToken.save();
        }

        //Save User
        await newUser.save();

        if (tick) {
            console.log("tick was true");
            // Send Tokens in cookies (Production settings)
            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24, // 24 hours
                httpOnly: true,
                sameSite: "None",
                secure: true // Only sent over HTTPS
            });

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24, // 24 hours
                httpOnly: true,
                sameSite: "None",
                secure: true // Only sent over HTTPS
            });
        }

        return res.status(200).json({
            status: 'success',
            user: newUser,
            auth: true
        });

    } catch (error) {
        console.log("Error", error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error'
        })
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return res.status(200).json({
                status: 'failed',
                message: 'User not found!'
            });
        }

        if (user.verified == false) {
            return res.status(200).json({
                status: 'failed',
                message: 'Account not verified!'
            })
        }

        // Comparing Password with hashed saved pass
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(200).json({
                status: 'failed',
                message: 'Invalid Password'
            });
        }

        // Token Generation 
        let accessToken, refreshToken;

        accessToken = JWTService.signAccessToken({ _id: user._id, email: user.email }, '30m');
        refreshToken = JWTService.signRefreshToken({ _id: user._id }, '60m');

        // Update refresh Token in database
        await RefreshTokenModel.updateOne(
            { userId: user._id },
            { $set: { token: refreshToken } },
            { upsert: true }
        );

        // Send Tokens in cookies (Production settings)
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            httpOnly: true,
            sameSite: "None",
            secure: true // Only sent over HTTPS
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            httpOnly: true,
            sameSite: "None",
            secure: true // Only sent over HTTPS
        });

        return res.status(200).json({
            status: 'success',
            user: user,
            auth: true
        });
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error!'
        });
    }
}

exports.logOutUser = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(200).json({
                status: 'failed',
                message: 'Refresh Token not found!'
            })
        }

        const deleteRefreshToken = await RefreshTokenModel.deleteOne({ token: refreshToken });

        if (!deleteRefreshToken) {
            return res.status(200).json({
                status: 'failed',
                message: 'Error Logging Out!'
            })
        }

        // Delete cookies
        res.clearCookie("accessToken", {
            httpOnly: true,
            sameSite: "None",
            secure: true // Only sent over HTTPS
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "None",
            secure: true // Only sent over HTTPS
        });

        // Response
        return res.status(200).json({
            status: 'success',
            user: null,
            auth: false
        });
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error'
        });
    }
}

exports.refresh = async (req, res) => {
    const originalRefreshToken = req.cookies.refreshToken;

    if (!originalRefreshToken) {
        return res.status(200).json({
            status: 'failed',
            message: 'Refresh token is missing',
            auth: false
        });
    }

    let id;
    try {
        const decoded = JWTService.verifyRefreshToken(originalRefreshToken);
        id = decoded._id;
    } catch (e) {
        console.error('Token verification failed:', e.message);
        return res.status(200).json({
            status: 'failed',
            message: 'Token verification failed'
        });
    }

    try {
        const match = await RefreshTokenModel.findOne({ userId: id, token: originalRefreshToken });
        if (!match) {
            return res.status(200).json({
                status: 'failed',
                message: 'Unauthorized'
            });
        }

        const accessToken = JWTService.signAccessToken({ _id: id }, "30m");
        const refreshToken = JWTService.signRefreshToken({ _id: id }, "60m");

        await JWTService.storeRefreshToken(refreshToken, id);

        res.cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            httpOnly: true,
            sameSite: "None",
            secure: true // Only sent over HTTPS
        });

        res.cookie("refreshToken", refreshToken, {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            httpOnly: true,
            sameSite: "None",
            secure: true // Only sent over HTTPS
        });

        const user = await UserModel.findById(id);

        if (!user) {
            return res.status(200).json({
                status: 'failed',
                message: 'User not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            user: user,
            auth: true
        });

    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error'
        });
    }
}

exports.fetchUsers = async (req, res) => {
    try {
        const users = await UserModel.find({ userType: { $ne: 'admin' } });
        if (!users) {
            return res.status(200).json({
                status: 'failed',
                message: 'No Users found!'
            })
        }
        return res.status(200).json({
            status: 'success',
            message: 'Users Fetched Succesfuly!',
            users: users
        })
    } catch (error) {
        console.log("Error", error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error!'
        })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(200).json({
                status: 'failed',
                message: 'User not found!'
            })
        }

        await user.deleteOne();

        return res.status(200).json({
            status: 'success',
            message: 'User removed Succesfuly!'
        })

    } catch (error) {
        console.log("Error", error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error'
        })
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { fname, lname, userId } = req.body;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(200).json({
                status: 'failed',
                message: 'User not found!'
            })
        }

        await UserModel.updateOne({ _id: user._id }, { $set: { fname, lname } });
        return res.status(200).json({
            status: 'success',
            message: 'Info Updated Succesfuly!'
        })
    } catch (error) {
        console.log("Error", error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error'
        })
    }
}

exports.downloadUserData = async (req, res) => {
    try {
        const users = await UserModel.find({}, { password: 0 });

        let usersData = [['UID', 'First Name', 'Last Name', 'Email', 'User Type']];

        users.forEach(user => {
            usersData.push([
                user._id.toString(),    // UID
                user.fname || '',       // First Name
                user.lname || '',       // Last Name
                user.email || '',       // Email
                user.userType || ''     // User Type
            ]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(usersData);
        XLSX.utils.book_append_sheet(wb, ws, 'Users Data');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

        res.setHeader('Content-Disposition', 'attachment; filename="users_data.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.send(excelBuffer);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error!'
        })
    }
}

exports.downloadTelegramUserData = async (req, res) => {
    try {
        const users = await TelegramModel.find();

        let usersData = [['Telegram Id', 'Date of Joining', 'Username', 'First Name', 'Last Name', 'tonWalletAddress', 'twitterUsername', 'balance']];

        users.forEach(user => {
            usersData.push([
                user.userId.toString(),
                user.createdAt || 'undefined',
                user.username || 'undefined',
                user.firstName || 'undefined',
                user.lastName || 'undefined',
                user.tonWalletAddress || 'undefined',
                user.twitterUserName || 'undefined',
                user.balance || 'undefined'
            ]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(usersData);
        XLSX.utils.book_append_sheet(wb, ws, 'Users Data');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

        res.setHeader('Content-Disposition', 'attachment; filename="users_data.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.send(excelBuffer);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error!'
        })
    }
}

exports.fetchTelegramUsers = async (req, res) => {
    try {
        const telegramUsers = await TelegramModel.find();
        if (!telegramUsers) {
            return res.status(200).json({
                status: 'failed',
                message: 'no users found!'
            })
        }
        else {
            return res.status(200).json({
                status: 'success',
                telegramUsers: telegramUsers
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error'
        })
    }
}

exports.createTask = async (req, res) => {
    try {
        const { img, priority, title, link, reward } = req.body;

        // Check if priority already exists
        const existingTask = await SocialModel.findOne({ priority: priority });
        if (existingTask) {
            return res.status(200).json({
                status: 'failed',
                message: 'Priority already taken!'
            });
        }

        // If priority doesn't exist, create a new task
        const newTask = new SocialModel({
            image: img,
            link: link,
            priority: priority,
            reward: reward,
            title: title
        });

        await newTask.save();

        return res.status(200).json({
            status: 'success',
            message: 'Task created successfully!',
            task: newTask
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error!'
        });
    }
};

exports.fetchTasks = async (req, res) => {
    try {
        const response = await SocialModel.find();
        if (!response) {
            return res.status(200).json({
                status: 'failed',
                message: 'No Social Task created!'
            })
        }
        else {
            return res.status(200).json({
                status: 'success',
                tasks: response
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error!'
        })
    }
}

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { img, priority, title, link, reward } = req.body;

        const existingTaskWithPriority = await SocialModel.findOne({ priority: priority, _id: { $ne: id } });
        if (existingTaskWithPriority) {
            return res.status(200).json({
                status: 'failed',
                message: 'Priority already taken!'
            });
        }

        const updatedTask = await SocialModel.findByIdAndUpdate(id, {
            image: img,
            link: link,
            priority: priority,
            reward: reward,
            title: title
        }, { new: true });

        if (!updatedTask) {
            return res.status(200).json({
                status: 'failed',
                message: 'Task not found!'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Task updated successfully!',
            task: updatedTask
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error!'
        });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await SocialModel.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(200).json({
                status: 'failed',
                message: 'Task not found!'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Task deleted successfully!',
            task: deletedTask
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error!'
        });
    }
};

exports.createDailyTask = async (req, res) => {
    try {
        const { img, priority, title, link, reward } = req.body;

        // Check if priority already exists
        const existingTask = await DailyModel.findOne({ priority: priority });
        if (existingTask) {
            return res.status(200).json({
                status: 'failed',
                message: 'Priority already taken!'
            });
        }

        // If priority doesn't exist, create a new task
        const newTask = new DailyModel({
            image: img,
            link: link,
            priority: priority,
            reward: reward,
            title: title
        });

        await newTask.save();

        return res.status(200).json({
            status: 'success',
            message: 'Task created successfully!',
            task: newTask
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error!'
        });
    }
};

exports.fetchDailyTasks = async (req, res) => {
    try {
        const response = await DailyModel.find();
        if (!response) {
            return res.status(200).json({
                status: 'failed',
                message: 'No Daily Task created!'
            })
        }
        else {
            return res.status(200).json({
                status: 'success',
                tasks: response
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error!'
        })
    }
}

exports.updateDailyTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { img, priority, title, link, reward } = req.body;

        const existingTaskWithPriority = await DailyModel.findOne({ priority: priority, _id: { $ne: id } });
        if (existingTaskWithPriority) {
            return res.status(200).json({
                status: 'failed',
                message: 'Priority already taken!'
            });
        }

        const updatedTask = await DailyModel.findByIdAndUpdate(id, {
            image: img,
            link: link,
            priority: priority,
            reward: reward,
            title: title
        }, { new: true });

        if (!updatedTask) {
            return res.status(200).json({
                status: 'failed',
                message: 'Task not found!'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Task updated successfully!',
            task: updatedTask
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error!'
        });
    }
};

exports.deleteDailyTask = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await DailyModel.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(200).json({
                status: 'failed',
                message: 'Task not found!'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Task deleted successfully!',
            task: deletedTask
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error!'
        });
    }
};

exports.createAnnouncement = async (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(200).json({ 
                status: 'failed',
                message: err.message 
            });
        }

        if (!req.file) {
            return res.status(200).json({ 
                status: 'failed',
                message: 'No file uploaded' 
            });
        }

        try {
            const { description, imageName, reward, status, subtitle, title } = req.body;

            const newAnnouncement = new AnnouncementModel({
                description,
                image: `/uploads/${req.file.filename}`,
                imageName,
                reward,
                status,
                subtitle,
                title
            });

            await newAnnouncement.save();

            res.status(201).json({
                status: 'success',
                message: 'Announcement created successfully!',
                announcement: newAnnouncement
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        }
    });
};

exports.updateAnnouncement = async (req, res) => {
    try {
        const { id, updateData } = req.body;

        if (!id || !updateData) {
            return res.status(200).json({
                status: 'failed',
                message: 'Announcement ID and update data are required!'
            });
        }

        // Find the announcement by ID
        const announcement = await AnnouncementModel.findById(id);

        if (!announcement) {
            return res.status(200).json({
                status: 'failed',
                message: 'Announcement not found!'
            });
        }

        // Update the announcement with the new data
        for (const key in updateData) {
            if (updateData.hasOwnProperty(key)) {
                announcement[key] = updateData[key];
            }
        }

        // Save the updated announcement
        await announcement.save();

        return res.status(200).json({
            status: 'success',
            message: 'Announcement updated successfully!',
            data: announcement
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error!'
        });
    }
}


exports.deleteAnnoucement = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAnnoucement = await AnnouncementModel.findByIdAndDelete(id);

        if (!deletedAnnoucement) {
            return res.status(200).json({
                status: 'failed',
                message: 'Annoucement not found!'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Annoucement deleted successfully!',
            task: deletedAnnoucement
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error!'
        })
    }
}

exports.toggleAnnoucement = async (req, res) => {
    try {
        const { id } = req.body;

        // Find the announcement by ID
        const announcement = await AnnouncementModel.findById(id);

        if (!announcement) {
            return res.status(200).json({
                status: 'failed',
                message: 'Announcement not found!'
            });
        }

        // Check if any other announcement is currently true
        const otherAnnouncement = await AnnouncementModel.findOne({ status: true });

        if (otherAnnouncement && otherAnnouncement._id.toString() !== id) {
            return res.status(200).json({
                status: 'failed',
                message: 'Another announcement is already active!'
            });
        }

        // Update the status of the found announcement
        announcement.status = !announcement.status; // Toggle status

        if (announcement.status) {
            await AnnouncementModel.updateMany({ _id: { $ne: id } }, { $set: { status: false } });
        }

        await announcement.save();

        return res.status(200).json({
            status: 'success',
            message: 'Announcement status updated successfully!',
            data: announcement
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error!'
        })
    }
}

exports.fetchAnnoucement = async (req, res) => {
    try {
        const annoucements = await AnnouncementModel.find();
        if (!annoucements) {
            return res.status(200).json({
                status: 'failed',
                message: 'No annoucement found!'
            })
        }
        return res.status(200).json({
            status: 'success',
            annoucements: annoucements
        })
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            status: 'failed',
            message: 'Internal Server Error!'
        })
    }
}


