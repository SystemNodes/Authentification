const transactionModel = require('../models/transactionModel');
const axios = require('axios');
const API_KEY = process.env.API_SECRET

exports.initializePayment = async (req, res) => {
    try {
        const { amount, email, name } = req.body;

        // Unique reference for each transaction
        const ref = `TCA-CLASS-${Date.now()}-${Math.floor(Math.random()*1000)}`

        const paymentData = {
            amount: amount,
            currency: 'NGN',
            customer: {
                email,
                name
            },
            reference: ref
        }

        const response = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', paymentData,{
            headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${API_KEY}`
            }
        });

        const transaction = new transactionModel({
            amount,
            email,
            name,
            reference: ref
        });

        await transaction.save();

        res.status(201).json({
            message: "Payment initiallized Successfully",
            data: {
                reference: response?.data?.data?.reference,
                url: response?.data?.data?.checkout_url
            }
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { reference } = req.query
        console.log('Ref: ', reference);

        const response = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
            headers: {
                Authorization: `Bearer ${API_KEY}`
            }
        });
       
        const transaction = await transactionModel.findOne({ reference });
        if (!transaction) {
            return res.status(404).json({
                message: 'Transaction not found'
            });
        }
        if (response?.data?.data.status === 'success') {
            
            transaction.status = 'Successful';
            await transaction.save();

            res.status(201).json({
                message: "Transaction verified Successfully"
            });
        } else {
            transaction.status = 'Failed'
            await transaction.save();

            res.status(201).json({
                message: "Transaction verified Successfully"
            });
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}