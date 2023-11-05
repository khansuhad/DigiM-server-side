const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000 ;

app.use(cors())
app.use(express.json())


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

async function run() {
  try {
   
    await client.connect();

    const jobCollection = client.db("a11DB").collection("jobs")

    app.get('/catagory/:catagory' , async(req , res) => {
      const catagory = req.params.catagory ;
      console.log(catagorys)
      const filter = { catagory : catagory};
      const cursor = jobCollection.find(filter);
      const result = await cursor.toArray();
      res.send(result);
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
  app.get('/jobs/catagory/:_id' , async(req , res) => {
    const id = req.params._id ;
    const query = {_id: new ObjectId(id)}
    const result = await jobCollection.findOne(query);
    res.send(result);
})

    app.get('/jobs', async(req , res) => {
        const cursor = jobCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post('/jobs', async(req, res) => {
        const job = req.body ;
        const result = await jobCollection.insertOne(job)
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