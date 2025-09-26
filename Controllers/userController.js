const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { signUpTemplate, verificationTemplate, resetPasswordTemplate } = require('../utils/emailTemplates');
const emailSender = require('../middleware/nodemailer');

exports.signUp = async (req, res) => {
    try{
        // Extract the user data from the request body
        const {firstName, lastName, email, password} = req.body;

        // Check if user already exist
        const userExist = await userModel.findOne({
            email: email.toLowerCase()
        });
        if (userExist) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const saltedRounds = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltedRounds);

        // Instantiate the user model
        const user = new userModel({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        // Saving the user document
        await user.save();

        // Generate a token for a user
        const token = jwt.sign({
            id: user._id,
            email: user.email
        }, process.env.JWT_SECRET, {expiresIn: '1h'});

        const link = `${req.protocol}://${req.get('host')}/users/verify/${token}`
        console.log('Link: ', link);

        // Email options for sending email
        const emailOption = {
            email: user.email,
            subject: 'Graduation Note',
            html: signUpTemplate(link, user.firstName)
        }

        // Send the email to the user
        await emailSender(emailOption);

        // Send a success response
        res.status(201).json({
            message: "User created successfully",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        }); 
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const {token} = req.params;
        if(!token){
            return res.status(400).json({
                message: 'Token not found'
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if(!user){
            return res.status(400).json({
                message: 'User not found'
            });
        }

        if (user.isVerified){
            return res.status(400).json({
                message: "User already verified, please proceed to login"
            });
        }
        
        user.isVerified = true;
        await user.save();

        res.status(200).json({
            message: "User verified successfully"
        });

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError){ // or error === 'jwt expired'
            return res.status(500).json({
                message: 'Session expired, please resend verification'
            });
        }

        res.status(500).json({
            error: error.message
        }); 
    }
};

exports.resendVerification = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await userModel.findOne({
            email: email.toLowerCase()
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "User already verified, please proceed to login"
            });
        }

        const token = jwt.sign({
            email: user.email,
            id: user._id
        }, process.env.JWT_SECRET, {expiresIn: '30mins'});

        const link = `${req.protocol}://${req.get('host')}/users/verify/${token}`;
        console.log(`Link: ${link}`);

        const options = {
            email: user.email,
            subject: 'Verification Email',
            html: verificationTemplate(link, user.firstName)
        }

        await emailSender(options);

        res.status(200).json({
            message: "Verification email sent successfull, please check your email to verify"
        });
        
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        // Extract the required fields
        const {email, password} = req.body;

        // Find the user with the email and check if the user exists
        const user = await userModel.findOne({
            email: email.toLowerCase()
        });
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            });
        }

        // Check if password is correct
        const passwordCorrect = await bcrypt.compare(password, user.password);
        if (passwordCorrect === false) {
            return res.status(400).json({
                message: 'Incorrect Password'
            });
        }

        // Check if user is verified
        if (user.isVerified === false) {
            return res.status(401).json({
                message: 'User not verified, please check your email for verification link'
            });
        }

        // Generate a token for the user
        const token = jwt.sign({
            email: user.email,
            id: user._id
        }, process.env.JWT_SECRET, {expiresIn: '1hr'});

        res.status(200).json({
            message: 'Login Successfull',
            token
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        // Extract the user email from the request body
        const {email} = req.body;

        // Find the user with the email and check if they exist
        const user = await userModel.findOne({
            email: email.toLowerCase()
        });
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            });
        }

        // Generate token & link for user
        const token = jwt.sign({
            email: user.email,
            id: user._id
        }, process.env.JWT_SECRET, {expiresIn: '10mins'});
        const link = `${req.protocol}://${req.get('host')}/users/reset/password/${token}`;

        // Create email options
        const options = {
            email: user.email,
            subject: 'Reset Password',
            html: resetPasswordTemplate(link, user.firstName)
        }

        await emailSender(options)
        
        res.status(200).json({
            message: 'Reset password request is successful'
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        // Get token from the params
        const {token} = req.params;

        // Extract the passwords from the request body
        const {newPassword, confirmPassword} = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(404).json({
                message: "Password does not match"
            })
        }

        // Verify the token with JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user
        const user = await userModel.findById(decoded.id);

        // Check if the user exist
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            });
        }

        // Encrypt the new password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        user.password = hashedPassword
        await user.save();

        res.status(500).json({
            message: "Password reset successful"
        });
        
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                message: "Linked expired, please request a new link"
            });
        }

        res.status(500).json({
            error: error.message
        });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword, confirmPassword} = req.body;

        const user = await userModel.findOne({
            email: email.toLowerCase()
        });

        // Validate oldpassword
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Password is not correct!"
            });
        }

        // Check newpassword matches the second entry
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        // Encrypt and safe the newpassword
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            message: "Password update successful"
        });
        
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}