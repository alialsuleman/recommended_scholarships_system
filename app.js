const express 	     = require ('express') ;
const bodyParser     = require ('body-parser'); 
const mysql        	 = require ('mysql') ;
const user           = require ('./server/routes/user.js') ;
const scholarship    = require ('./server/routes/scholarship.js') ;
const authController = require("./server/controllers/auth.js");


require('dotenv').config() ;
const path = require("path")




const port = process.env.PORT || 5000;





const app = express() ;

const cookieParser = require("cookie-parser");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'html');



// ROUTE ..... 



app.use('/', require('./server/routes/auth'));

app.use('/user',user) ;
app.use('/scholarship',scholarship) ;













app.listen(port,()=>{console.log(`server start on port ${port}`)}) ;