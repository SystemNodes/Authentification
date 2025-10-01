const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    reference: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Successful', 'Failed'],
        default: 'Pending'
    },
}, {timestamps: true});

const transactionModel = mongoose.model('Transactions', transactionSchema);

module.exports = transactionModel;