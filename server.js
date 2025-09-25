const express = require('express');
require('./config/database');
const userRouter = require('./routers/userRouter');
const PORT = process.env.PORT
const app = express();

app.use(express.json());
app.use(userRouter);


app.listen(PORT, ()=>{
    console.log(`Server is running on PORT: ${PORT}`);
});