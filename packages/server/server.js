require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const jobs = require("./routes/api/jobs");
const users = require("./routes/api/users");
const categories = require("./routes/api/categories");
const configs = require("./routes/api/configs");
const auth = require("./routes/api/auth");
const ngrok = require('ngrok');

var compression = require("compression");
var cors = require("cors");


const app = express();

//Helmet Middleware
app.use(helmet());

//Leer config stage y port
const environment = process.env.NODE_ENV; // development
const stage = require('./config')[environment];

const mongoURI = process.env.MONGO_URI;

//Usar express body parser
app.use(express.json());

//Archivos staticos para logos
app.set(express.static("public"));

app.use(compression());
app.use(cors());


//Live sign
app.get("/", function (req, res) {
  res.send("Vivo");
});


//Conectar a DB Mongo
mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
      
})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Usa rutas
app.use("/api/jobs", jobs);
app.use("/api/users", users);
app.use("/api/categories", categories);
app.use("/api/configs", configs);
app.use("/api", auth);

app.listen(5000, () => {
  console.log(`Example app listening on port 5000!`);
  (async function(){
    const endpoingAccessibleOnTheInternet = await ngrok.connect(5000);
    console.log(`Publically accessible tunnel to localhost${endpoingAccessibleOnTheInternet}`);
  })
 
});

// app.listen(`${stage.port}`, () => {
//   console.log(`Example app listening on port ${stage.port} !`);
// });

