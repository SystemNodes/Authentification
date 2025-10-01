const express = require('express');
require('./config/database');
const cors = require('cors');
const userRouter = require('./routers/userRouter');
const transactionRouter = require('./routers/transactionRouter');
const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors('*'));
app.use(userRouter);
app.use(transactionRouter);


app.listen(PORT, ()=>{
    console.log(`Server is running on PORT: ${PORT}`);
});
