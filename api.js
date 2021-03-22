const express= require('express')
const app=express();
const client = require('mongodb').MongoClient;
const bodyParser=require('body-parser')
const jwt=require('jsonwebtoken')

client.connect('mongodb://localhost:27017/').then(db=>{

app.use(bodyParser.json()); 
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','OPTION,GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type')
    next();
})

app.get('/check/:name',(req,res)=>{
    console.log(req.params.name);
    db.db('whatsdown').collection('user').find({username:req.params.name}).toArray().then(data=>{
        if(data.length!=0){
            console.log(data);
            return res.json({avail:false})
        }
        else
            return res.json({avail:true});
    }).catch(err=>{
        console.log(err);
    })

})

app.post('/getMsg',(req,res)=>{
    var sender=req.body.sender;
    var receiver=req.body.receiver;
    console.log('sendder: '+sender)
    console.log('rev: '+receiver)
    db.db('whatsdown').collection('message').find({$or:[{sender:sender,receiver:receiver},{sender:receiver,receiver:sender}]}).sort({key:1})
    .toArray().then(result=>{
        console.log(result)
        return res.json({msg:result})
    })
})

app.post('/add',(req,res)=>{
    db.db('whatsdown').collection('user').findOne({username:req.body.username}).then(result=>{
        if(!result){
        db.db('whatsdown').collection('user').insertOne({username:req.body.username,password:req.body.password}).then(data=>{
            return res.json({add:'ok'});
        })
    }
    else
        return res.status(403).json({msg:"username already available"});
    })
    
})

app.post('/login',(req,res)=>{
    var username=req.body.username;
    var password=req.body.password;
    db.db('whatsdown').collection('user').findOne({username:username,password:password}).then(data=>{
        if(!data){
            return res.status(403).json({msg:'usernamae and password are incorrect'});
        }
        else{
        var token=jwt.sign({username:username,password:password},'12djsjskjkj')
        res.status(200).json({token:token});
        }
    })
})

app.get('/check',(req,res)=>{
    return res.json({avail:false})
})

app.post('/getRecent',(req,res)=>{
    var userToken=req.body.token.token;
    console.log(userToken);
    var payload=jwt.verify(userToken,'12djsjskjkj');
    db.db('whatsdown').collection('current').find({user:payload.username}).toArray().then(result=>{
        console.log(result)
        return res.json(result);
    })
})

app.post('/storeMsg',(req,res)=>{
    var userToken = req.body.token;
    var msg = req.body.msg;
    console.log(msg);
    db.db('whatsdown').collection('message').insertOne(msg).then(result=>{
        res.json({msg:'added'})
    });
})

app.post('/getUser',(req,res)=>{
    var userToken=req.body.token;
    console.log(userToken);
    var payload=jwt.verify(userToken,'12djsjskjkj');
    return res.json(payload.username);
})


}).catch(err=>{
    console.log(err);
})



app.listen(8080,()=>{
    console.log('running in 8080 port')
})