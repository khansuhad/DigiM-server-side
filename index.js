const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000 ;

app.use(cors({
  origin:[
    'http://localhost:5173'
  ],
  credentials: true 
}))
app.use(express.json())
app.use(cookieParser())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.5y6t7ws.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const logger = (req , res , next) => {
  console.log('log : info',req.method , req.url);
  next();
}
const verifyToken = async(req , res, next) => {
  const token = req?.cookies?.token;
  console.log('tok tok tokennn',token);
  if(!token){
    return res.status(401).send({message : 'unauthorized access'})
  }
  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET ,(err , decoded) => {
    if(err){
      return res.status(401).send({message : 'unauthorized access'})
    }
    req.user = decoded;
    next();
  })

}
async function run() {
  try {
   
    await client.connect();

    const jobCollection = client.db("a11DB").collection("jobs")
    const bidCollection = client.db("a11DB").collection("bids")
    const storyCollection = client.db("a11DB").collection("stories")

    app.post('/jwt' , async(req,res) => {
      const user = req.body ;
      const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET ,{expiresIn :'10h'})
      res
      .cookie('token', token ,{
        httpOnly: true ,
        secure: true ,
        sameSite:'none'
      })
      .send({status : true})
    })
    app.post('/logout' , async(req, res) => {
      const user = req.body;
      res.clearCookie('token' , {maxAge:0}).send({status: true})
    })

    app.get('/catagory/:catagory' , async(req , res) => {
      const catagory = req.params.catagory ;
      console.log(catagorys)
      const filter = { catagory : catagory};
      const cursor = jobCollection.find(filter);
      const result = await cursor.toArray();
      res.send(result);
  })
  app.delete('/jobs/catagory/:_id' , async(req , res) => {
    const id = req.params._id;
    
    const query = {_id : new ObjectId(id)};
    const result = await jobCollection.deleteOne(query);
    res.send(result)

})
  app.put( '/jobs/catagory/:_id' , async(req , res) => {
    const id = req.params._id;
    console.log(id);
  const filter = { _id : new ObjectId(id)} ;
    const options = { upsert: true };
    const updateJob = req.body ;
    const job = {
        $set: {
         jobTitle : updateJob.jobTitle ,
         deadLine : updateJob.deadLine ,
         minimumPrice : updateJob.minimumPrice ,
         maximumPrice : updateJob.maximumPrice ,
         description : updateJob.description 
         
         

        },
      };
      const result = await jobCollection.updateOne(filter , job , options);
      res.send(result)
    
})
  app.patch( '/bids/:_id' , async(req , res) => {
    const id = req.params._id;
    console.log(id);
    const filter = { _id : new ObjectId(id)} ;
    const updateStatus = req.body ;
    console.log(updateStatus);
    const bidsAcceptStatus = {
        $set: {
          status : updateStatus.status ,  

        },
      };
      const result = await bidCollection.updateOne(filter , bidsAcceptStatus);
      res.send(result)
    
})


  app.get('/jobs/catagory/:_id' , async(req , res) => {
    const id = req.params._id ;
    const query = {_id: new ObjectId(id)}
    const result = await jobCollection.findOne(query);
    res.send(result);
})
// app.get('/bids', async(req,res) => {
//   let query = {}
//   const coook = await req?.user;
//   console.log('nnnn', coook );
//   console.log('email',req?.user?.email , req?.query?.email)
//   // if(req?.user?.email !== req?.query?.myEmail){
//   //   return res.status(403).send({message : 'forbidden access'})
//   // }
//   if(req.query?.email){
//       query = { email : req.query?.email }
//   }
//   const result = await bidCollection.find(query).toArray();
//   res.send(result)
// })
app.get('/bids',logger,verifyToken, async(req,res) => {
  let query = {}
  const coook = await req?.user;
  console.log('nnnn', coook );
  console.log('emaillllllll...',req?.user?.email , req?.query)
  if(req?.user?.email === req?.query?.myEmail){
       query = { myEmail : req.query?.myEmail }
  
  }
  else if( req?.user?.email === req.query?.email){
     query = { email : req.query?.email }
  }
  else{
    return res.status(403).send({message : 'forbidden access'})
  }
  const result = await bidCollection.find(query).sort({status : 1}).toArray();
  res.send(result)
})

  app.get('/bids/:_id' , async(req , res) => {
    const id = req.params._id ;
    const query = {_id: new ObjectId(id)}
    const result = await bidCollection.findOne(query);
    res.send(result);
})

    app.get('/jobs', async(req , res) => {
        const cursor = jobCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/bids', async(req , res) => {
        const cursor = bidCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/stories', async(req , res) => {
        const cursor = storyCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post('/jobs', async(req, res) => {
        const job = req.body ;
        const result = await jobCollection.insertOne(job)
        res.send(result);
        
    })
    app.post('/bids', async(req, res) => {
        const bid = req.body ;
  
        const result = await bidCollection.insertOne(bid)
        res.send(result);
        
    })
    app.post('/stories', async(req, res) => {
        const story = req.body ;
     
        const result = await storyCollection.insertOne(story)
        res.send(result);
        
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
  }
}
run().catch(console.dir);


app.get('/', (req , res) => {
    res.send('daata is coming soon....')
})

app.listen(port , (req , res) => {
    console.log(`database is running succesfully ${port}`)
})