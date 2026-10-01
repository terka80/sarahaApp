
import express from'express'
import cors from 'cors'
import { globalErrorHandling } from './middleware/index.js'
import { PORT } from './config.js'
import { authenticationController, messageController, userController } from './modules/index.js'
import { bootstrapDB } from './DB/connection.db.js'
import { encryption } from './common/security/encryption.security.js'
import { client } from './DB/redis.connection.js'
import { setCache } from './common/services/index.js'
const app=express();

await bootstrapDB(app,PORT)
app.use(cors(),express.json())  


await setCache({key:'age',value:21,ttl:60})




app.all('/',async (req,res,next)=>res.status(200).send({message:'welcome on our API'}))

app.use('/auth',authenticationController)
app.use('/message',messageController)
app.use('/user',userController)


app.all('{/*dummy}',(req,res,next)=>{res.status(404).send({message:'invalid in app routing'})})
app.use(globalErrorHandling)

