import mongoose from "mongoose";
import { DB_URI } from "../config.js";
import { UserModel } from "./model/index.js";

export const bootstrapDB=async(app,port)=>{
    try {
        await mongoose.connect(DB_URI,{serverSelectionTimeoutMS:30000})
        await UserModel.syncIndexes()
        console.log('connect on DB ');
        app.listen(port,()=>console.log(`app is listening on port : ${port} `))
    } catch (error) {
        console.log({error});
        console.log(`fail on connecting DB`);
        
        
    }
}