const express = require('express');
require('./config/database');
const cors = require('cors');
const userRouter = require('./routers/userRouter');
const PORT = process.env.PORT
const app = express();

app.use(express.json());
app.use(cors('*'));
app.use(userRouter);

// console.log("🔑 RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Loaded" : "Not Found");

app.listen(PORT, ()=>{
    console.log(`Server is running on PORT: ${PORT}`);
});
