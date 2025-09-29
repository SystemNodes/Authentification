const { 
    signUp, 
    verifyUser, 
    resendVerification, 
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    getAll
} = require('../Controllers/userController');
const { authentication } = require('../middleware/authentication');
const { 
    signUpValidator, 
    loginValidator 
} = require('../middleware/validator');

const router = require('express').Router();

router.post('/users', signUpValidator, signUp);
router.get('/users/verify/:token', verifyUser);
router.post('/users/resend-verification', resendVerification);
router.post('/users/login', loginValidator, login);
router.post('/users/forgot-password', forgotPassword);
router.post('/users/reset/password/:token', resetPassword);
router.put('/users/update-password', authentication, updatePassword);
router.get('/users', getAll);

module.exports = router;
