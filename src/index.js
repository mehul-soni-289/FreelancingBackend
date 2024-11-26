import { app } from "./app.js";
import { connectDB } from "./db/dbConnection.js";
import  'dotenv/config'


connectDB()
.then(()=>{
  app.listen(process.env.PORT , ()=>{
    console.log("App is running on "+process.env.PORT);
    
  })  
})