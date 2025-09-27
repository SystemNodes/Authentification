const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

exports.authentication = async (req, res, next) => {
    try {
        const auth = req.headers.authorization
        const token = auth.split(" ")[1];
        // console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                message: 'Authentication failed: User not found'
            })
        }
        
        req.user = decoded;

        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError){ // or error === 'jwt expired'
            return res.status(500).json({
                message: 'Session expired, please resend verification'
            });
        }

        res.status(500).json({
            error: error.message
        })
    }
}