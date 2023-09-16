const mysql = require('mysql');
require('dotenv').config();

module.exports = () => {
    return    mysql.createPool({
	connectionLimit :100 ,
	host			:process.env.DB_HOST,
	user			:process.env.DB_USER,
	password		:process.env.DB_PASS,
	database		:process.env.DB_NAME,
    }) ;
}

//const dbConnection =require('./boolConnection.js') ;
//const pool  = dbConnection() ;
/*
pool.getConnection((err ,Connection)=>{
		if(err)throw err ;
        let queryString="" ;
		console.log(`connected as ID ${Connection.threadId} `) ;
		Connection.query(queryString,[param],(err , rows)=>{
			Connection.release() ;
			if(err)throw err ;		
		})
}) ;





*/