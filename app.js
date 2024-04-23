require("dotenv").config()
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const mongoSanitize = require('express-mongo-sanitize');
const errorMiddleware=require('./middlewares/errorMiddleware')
const connectDB = require('./db/connect');
const router=require('./routes/index')

const app = express();



// Middleware
app.use(cors());

app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.use(router);
app.get('/',(req,res)=>{
  res.send('myzanya app')
})

// Error middleware
app.use(errorMiddleware)
const port=process.env.PORT|| 4000;


const start = async () => {
    try {
      await connectDB(process.env.MONGO_URI)
      app.listen(port, () =>
        console.log(`Server is listening on port ${port}...`)
      );
    } catch (error) {
      console.log(error);
    }
  };
  
  start();

