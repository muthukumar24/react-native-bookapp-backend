import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if(!token) {
            return res.status(401).json({ message: 'No Authentication Token, Access Denied'});
        }

        // Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find User
        const user = await User.findById(decoded.userId).select("-password");
        if(!user) {
            return res.status(401).json({message: 'Token is not Valid'});
        }

        req.user = user;
        next();

    } catch (error) {
        console.log('Authentication Error', error.message);
        res.status(401).json({message: "Token is not Valid"});
    }
};

export default protectRoute;