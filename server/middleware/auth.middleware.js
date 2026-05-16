import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return next();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password text");
        next();
    } catch (error) {
        next(); // Proceed as guest if token is invalid
    }
};