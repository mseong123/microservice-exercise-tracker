require('dotenv').config();
const express = require('express');
const app = express();
const serverless=require('serverless-http')
const cors = require('cors')
const userModel=require('./database/models/userModel.js');
const mongoose=require('mongoose');

app.use(express.urlencoded({extended:false}));
app.use(cors())

/*
function dateConversion(dateParam) {
  const days=['Mon','Tue','Wed','Thurs','Fri','Sat','Sun']
  const month = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
  let date=new Date(dateParam)
  return days[date.getDay()-1] + ' '+ month[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
}
*/

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
        let {username,_id}=await newUser.save()
        res.json({username,_id}); 
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

app.post('/api/users/:_id/exercises',async function(req, res) {
  try {
    await mongoose.connect(process.env.MONGO_URI)

      let result=await userModel.findOneAndUpdate(
        {_id:req.params._id},
        {
          $push:{log:{
            description:req.body.description,
            duration:parseInt(req.body.duration),
            date:req.body.date? new Date(req.body.date).toDateString():new Date().toDateString()
          }
            }
        },
        {new:true}
        )

      res.json({
        _id:result._id,
        username:result.username,
        date:result.log[result.log.length-1].date,
        duration:result.log[result.log.length-1].duration,
        description:result.log[result.log.length-1].description
      })

  }
  
  catch (err) {
    res.json({
      message:'Error',error:err}
      );
  }
})

app.get('/api/users/:_id/logs',async function(req, res) {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    
    let result=await userModel.findOne({_id:req.params._id})
    
    if (req.query.from && !req.query.to){
      
      let logResult=result.log.filter(
        (exercise)=>new Date(exercise.date)>=new Date(req.query.from)
        )
        req.query.limit?
        res.json({
          _id:result._id,
          username:result.username,
          count:req.query.limit,
          log:logResult.slice(0,parseInt(req.query.limit))
        }):res.json({
          _id:result._id,
          username:result.username,
          count:logResult.length,
          log:logResult
        })
    } 
    
    else if (!req.query.from && req.query.to) {
      let logResult=result.log.filter(
        (exercise)=>new Date(exercise.date)<=new Date(req.query.to)
        )
        req.query.limit?
        res.json({
          _id:result._id,
          username:result.username,
          count:req.query.limit,
          log:logResult.slice(0,parseInt(req.query.limit))
        }):res.json({
          _id:result._id,
          username:result.username,
          count:logResult.length,
          log:logResult
        })
    }
    
    else if ((req.query.from && req.query.to)) {
      let logResult=result.log.filter(
        (exercise)=>new Date(exercise.date)>=new Date(req.query.from) && 
        new Date(exercise.date)<=new Date(req.query.to)
        )
        req.query.limit?
        res.json({
          _id:result._id,
          username:result.username,
          count:req.query.limit,
          log:logResult.slice(0,parseInt(req.query.limit))
        }):res.json({
          _id:result._id,
          username:result.username,
          count:logResult.length,
          log:logResult
        })
    }

    else {
      req.query.limit?
        res.json({
          _id:result._id,
          username:result.username,
          count:req.query.limit,
          log:result.log.slice(0,parseInt(req.query.limit))
        }):
        res.json({
          _id:result._id,
          username:result.username,
          count:result.log.length,
          log:result.log
        })
    }

  }
  catch (err) {
    res.json({
      message:'Error',error:err}
      );
  }

})


module.exports.handler=serverless(app)
