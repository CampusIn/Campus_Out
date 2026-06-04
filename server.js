import app from './src/app.js';
import connectDB from './src/config/db.js';
import config from './src/config/config.js';


const port = config.PORT;
//Connect to Database
connectDB();

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})