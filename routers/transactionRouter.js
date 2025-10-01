const { 
    initializePayment, 
    verifyPayment 
} = require('../Controllers/transactionController');

const router = require('express').Router();

router.post('/initialize-transaction', initializePayment);
router.get('/verify-transaction', verifyPayment);

module.exports = router;