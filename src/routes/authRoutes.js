import express from 'express';
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import 'dotenv/config';

const router = express.Router();

const generateToken = (userId) => {
    jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '1hr'});
}

router.post('/register', async (req, res) => {
    try {
        const {email, username, password} = req.body;
        if(!username || !email || !password){
            return res.status(400).json({message: 'All Fields are Required'});
        }

        if(password.length < 6) {
            return res.status(400).json({message: 'Password should be atleast 6 characters'});
        }

        if(username.length < 3){
            return res.status(400).json({message: 'Username should be atleast 3 characters'})
        }

        // Check if user already exist
        // const existingUser = await User.findOne({$or: [{email}, {username}]});
        // if(existingUser) {
        //     return res.status(400).json({message: 'User Already Exist'})
        // }

        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({message: 'Email already exists'});
        }

        const existingUsername = await User.findOne({username});
        if(existingUsername){
            return res.status(400).json({message: 'Username already exists'});
        }

        // Random Avatar for Profile Image
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const user = new User ({
            email,
            username,
            password,
            profileImage
        })

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
                token, 
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage
                }
            });
    } catch (error) {
        console.log('Error in the register route', error);
        res.status(500).json({message: 'Internal Server Error'})
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({message: 'All Fields are required'});
        }

        // Check if user exists
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid Credentials'});
        }

        // Check if password is correct
        const isPasswordCorrect = await user.comparePassword(password);

        if(!isPasswordCorrect){
            return res.status(400).json({message: 'Invalid Credentials'})
        }

        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage, 
            },
        });
    } catch (error) {
        console.log('Error in login route', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});


export default router;