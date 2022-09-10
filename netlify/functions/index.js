const express = require('express');
const app = express();
const serverless=require('serverless-http')
const cors = require('cors')
const userModel=require('./database/models/userModel.js');
const mongoose=require('mongoose');

app.use(express.urlencoded({extended:false}));
app.use(cors())

app.post('/api/users', async function(req, res) {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    if (req.body.username && await userModel.exists({
      username:req.body.username
      })) {
        res.send('Username already exist!')
      } else {
        let newUser=new userModel({
          username:req.body.username
        })
        res.json(await newUser.save()); //find a way to remove __v property
      }
  }
  catch(err) {
    res.send(err)
  }
})

app.get('/api/users',async function(req, res) {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    res.json(await userModel.find().select('username _id').exec())
  }
  catch (err) {
    res.send(err)
  }
})


module.exports.handler=serverless(app)
