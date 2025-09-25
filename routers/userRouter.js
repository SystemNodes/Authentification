const { 
    signUp, 
    verifyUser, 
    resendVerification, 
    login,
    forgotPassword,
    resetPassword,
    updatePassword
} = require('../Controllers/userController');

const router = require('express').Router();

router.post('/users', signUp);
router.get('/users/verify/:token', verifyUser);
router.post('/users/resend-verification', resendVerification);
router.post('/users/login', login);
router.post('/users/forgot-password', forgotPassword);
router.post('/users/reset/password/:token', resetPassword);
router.put('/users/update-password', updatePassword);

module.exports = router
