
const dbConnection = require('../../poolConnection.js');
const pool  = dbConnection() ;
const Mysql = require('sync-mysql') ;
const connection = new Mysql ({
	host			:process.env.DB_HOST,
	user			:process.env.DB_USER,
	password		:process.env.DB_PASS,
	database		:process.env.DB_NAME,
}) ;



exports.getAll = (req, res)=>{
    pool.getConnection((err ,Connection)=>{
		if(err)throw err ;
        let queryString="SELECT * FROM scholarships" ;
		Connection.query(queryString,(err , rows)=>{
            res.send(rows) ;
            Connection.release() ;
            if(err)throw err ;	
        }) ;
    }) ;
}


exports.getMajor = (req, res)=>{
    let sId = req.body.id ;
    pool.getConnection((err ,Connection)=>{
		if(err)throw err ;
        let queryString=`SELECT id, title  FROM major where sid =${sId}` ;
		Connection.query(queryString,(err , rows)=>{
            res.send(rows) ;
            Connection.release() ;
            if(err)throw err ;	
        }) ;
    }) ;
}


exports.getCondition = (req, res)=>{
    let majorId = req.body.id ;
    let here = connection.query(`SELECT  * FROM majorconditions where majorID=${majorId}`) ;
    res.send(here) ;
}



exports.removescholar = (req, res)=>{
    let id = req.body.id ;
    let major =  connection.query(`select id from major where sid =${id}  `) ;
    for (i of major)
    {
        connection.query(`Delete FROM majorconditions where majorID=${i.id}`) ;
        connection.query(`Delete FROM major where id=${i.id} `) ;
    }
    connection.query(`Delete from scholarships where id=${id} `) ;
    res.send({"status":"ok"}) ;
   
}
exports.removemajor = (req, res)=>{
    let majorId = req.body.majorId ;
    connection.query(`Delete FROM majorconditions where majorID=${majorId}`) ;
    connection.query(`Delete FROM major where id=${majorId} `) ;
    res.send({"status":"ok"}) ;
}

exports.removecondition = (req, res)=>{
    let idC = req.body.conditionID  ;
    let majorId = req.body.majorId ;
    connection.query(`Delete FROM majorconditions where majorID=${majorId} and  conditionID=${idC}`) ;
  //  buildTree(majorId) ;
    res.send({"status":"ok"}) ;
}
 



exports.addscholar = (req, res)=>{
    let { title, contain, startDate, expiryDate } = req.body;
    let start = new Date(startDate) ;
    let expiry= new Date(expiryDate) ;
 
    
    
    pool.getConnection((err ,Connection)=>{
		if(err)throw err ;
        let queryString="insert into scholarships  SET title=?	,contain=?,	startDate=? ,expiryDate=?" ;
		Connection.query(queryString,[title, contain, start, expiry],(err )=>{
            Connection.release() ;
            if(err)throw err ;	
        }) ;
    }) ;
    
    
   res.send({"msg":"OK"}) ;
}

exports.addmajor = (req, res)=>{
    let  {sID ,title, city, spNeed, lang} = req.body;
    city= city.toLowerCase() ;
    spNeed= spNeed.toLowerCase() ;
    lang=lang.toLowerCase() ;
    
    pool.getConnection((err ,Connection)=>{
		if(err)throw err ;
        let queryString="insert into major  SET sID=? ,title=?, city=?, spNeed=?,lang=?, nextCond=?" ;
		Connection.query(queryString,[sID ,title, city, spNeed, lang ,0],(err )=>{
            Connection.release() ;
            if(err)throw err ;	
        }) ;
    }) ;

    res.send({"msg":"OK"}) ;
}

/*
function buildTree (id){

//
   let here = connection.query(`SELECT  conditionID ,type, name FROM majorconditions where    majorID = ${id}`) ;
   //console.log("asd") ;
   here.reverse(); 
   //console.log(here) ;


   let last = 0;
   for (i of here)
   {
        let mod = connection.query(`SELECT * FROM conditions where  name ="${i.name}" and type="${i.type}"`) ;
    //  console.log(i.name) ;
        if (mod.length==0)
        {
            connection.query(`INSERT INTO conditions (id ,name, type , nextid) VALUES (${iid},"${i.name}","${i.type}",${last})`);
            last = iid ++;
           // console.log(res) ;
        }
        else{
           let x = connection.query(`SELECT * FROM conditions where  name ="${i.name}" and type="${i.type}" and  nextID=0`) ;
           if(x.length==0){
            let y = connection.query(`SELECT * FROM conditions where  name ="${i.name}" and type="${i.type}" and  nextID=${last}`) ;
            if(y.length==0)connection.query(`INSERT INTO conditions (id ,name, type , nextid) VALUES (${mod[0].id },"${i.name}","${i.type}",${last})`);
           }
           else connection.query(`UPDATE conditions SET nextID=${last} where  id = ${ x[0].id} and  nextID=0`) ;
            last = mod[0].id ;
        }
   }
   //console.log(id) ;
    connection.query(`UPDATE major SET nextCond=${last} where  id = ${id}`) ;
}


*/

exports.addcondition = (req, res)=>{
    
    let  {id , name} = req.body;//conditions
    name= name.toLowerCase() ;
    console.log(name) ;
    let type='y';
    let here = connection.query(`SELECT * FROM conditionsname where  name="${name}"`) ;
    if (here[0]) ;
    else 
    {
        connection.query(`INSERT INTO conditionsname(name, type) VALUES ("${name}","${type}")`);//["name", "type"]) ;
        here = connection.query(`SELECT * FROM conditionsname where  name="${name}"  and type="${type}"`) ;
    }
    let r  = connection.query(`SELECT * FROM majorconditions where  conditionID="${here[0].id }" and majorID="${id}" and type="${type}"`) ;
    if (r.length==0)connection.query(`insert into majorconditions  (conditionID,majorID,type, name) VALUES ( ${here[0].id }  ,${id} ,"${type}","${name}")  `) ;
 
    res.send({"msg":"OK"}) ;
}













/*

*/

/*

exports.editscholar = (req, res)=>{
  
}

exports.editmajor = (req, res)=>{
  
}

exports.editcondition = (req, res)=>{
  
}

{
    "title":"منحة إيرا فرانسيس ديفيز الدراسية الممولة بالكامل" ,
    "contain":"منحة إيرا فرانسيس ديفيز الدراسية هي منحة دراسية كاملة الرسوم الدراسية تمنح عادة لطالبة واحدة متميزة في كل عام دراسي. يجب أن يكون الطالب مواطنا ومقيما في بلد نام مؤهل ، والذي يتابع برنامج الماجستير للدراسات العليا داخل كلية الطب والصحة وعلوم الحياة.",
    "startDate":"2023-05-13",
    "expiryDate":"2023-05-13"
}


{
    "sID":"8" ,
    "title":"study computer SSS", 
    "city":"homs" ,
     "spNeed":"computer" , 
     "lang":"english"
}

{
 "title":"منحة1" ,
    "contain":"منحة1 منحة 1",
    "startDate":"2023-05-13",
    "expiryDate":"2023-05-13"

}
    
{
   "sID" :9 ,
   "title":"تخصص1"   ,
   "city" :"homs", 
   "spNeed":"t", 
   "lang":"arabic"
}


{
   "sID":10 ,
   "title":"t4",
   "city":"homs", 
   "spNeed":"t", 
   "lang":"arabic"
}

*/