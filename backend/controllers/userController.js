import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const getUserProfile = async (req, res) => {
    //We will fetch user profile either based on username or userId
    //query is either username or userId
    const { query } = req.params;
    try {
        let user;
        //query is userId
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
        }
        else {
            //query is username
            user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
        }
        if (!user) {
            return res.status(400).json({
                error: "User not found"
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
        console.log("Error in getUserProfile: ", error.message);
    }
}

const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        const user = await User.findOne({ $or: [{ email }, { username }] });

        //if user exists
        if (user) {
            return res.status(400).json({
                error: "User already exists"
            });
        }

        //generating salt for hashing the user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //creating new user with given credentials
        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
        });

        //saving the new user in the database
        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic
            });
        }
        else {
            res.status(400).json({
                error: "Invalid user data"
            });
        }

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
        console.log("Error in signupUser: ", error.message);
    }
}

//function for login user
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({
                error: "Invalid username or password"
            });
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
        console.log("Error in loginUser: ", error.message);
    }
}

const logoutUser = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
        console.log("Error in logoutUser: ", error.message);
    }
}

const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json({
                error: "You cannot follow/unfollow yourself"
            });
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({
                error: "User not found"
            });
        }

        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            // Unfollow user
            // Modify the current user following, modify followers of userToModify
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            res.status(200).json({
                message: "User unfollowed successfully"
            });
        }
        else {
            //Follow user
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            res.status(200).json({
                message: "User followed successfully"
            });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in followUnFollowUser: ", error.message);
    }
}

const updateUser = async (req, res) => {
    const { name, email, username, password, bio } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                error: "User not found"
            });
        }

        if (req.params.id !== userId.toString()) {
            return res.status(400).json({
                error: "You cannot update other user's profile"
            });
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        //uploading profile pic to cloudinary
        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        //updating the username & userProfilePic in all the posts that this user replied
        await Post.updateMany(
            {"replies.userId":userId},
            {
                $set:{
                    "replies.$[reply].username":user.username,
                    "replies.$[reply].userProfilePic":user.profilePic
                }
            },
            {arrayFilters: [{"reply.userId":userId}]}
        )

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
        console.log("Error in updateUser: ", error.message);
    }
}

export { signupUser, loginUser, logoutUser, followUnFollowUser, updateUser, getUserProfile };