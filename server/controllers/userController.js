
const cookieSession = require('cookie-session');
const dbConnection = require('../../poolConnection.js');
const pool  = dbConnection() ;
const Mysql = require('sync-mysql') ;
const connection = new Mysql ({
	host			:process.env.DB_HOST,
	user			:process.env.DB_USER,
	password		:process.env.DB_PASS,
	database		:process.env.DB_NAME,
}) ;


let sFromm={} ;
let major = connection.query('SELECT * FROM major') ;
for (i of major){sFromm[i.title]=i.sID ;}

let scholarshipsFromId={} ;
let scholarships = connection.query('SELECT * FROM scholarships') ;
for (i of scholarships)scholarshipsFromId[i.id]=i ;


let conditions = connection.query('SELECT id,name FROM conditionsname') ;
let nameFromId={} ;
for (i of conditions)nameFromId[i.id]=i.name ;

let numberOfCondition =  connection.query(`SELECT MAX(id) as id FROM conditionsname `) ;

let typeA ={} ;
typeA[1]='country' ;
typeA[2]='major' ;
typeA[3]='language' ;



//console.log(result) ;





class Graph {

    // defining vertex array and
    // adjacent list
    constructor(noOfVertices)
    {   
        this.noOfVertices = noOfVertices;
        this.AdjList = new Map();
    }
    addVertex(v)
    {
        // initialize the adjacent list with a
        // null array
        this.AdjList.set(v, []);
    }
    addEdge(v, w)
    {
      
        // get the list for vertex v and put the
        // vertex w denoting edge between v and w
        this.AdjList.get(v).push(w);
    
        // Since graph is undirected,
        // add an edge from w to v also
    }
    // Prints the vertex and adjacency list
    printGraph()
    {
        // get all the vertices
        var get_keys = this.AdjList.keys();

        // iterate over the vertices
        for (var i of get_keys)
        {
            // get the corresponding adjacency list
            // for the vertex
            var get_values = this.AdjList.get(i);
            var conc = "";

            // iterate over the adjacency list
            // concatenate the values into a string
            for (var j of get_values)
                conc += j + " ";

            // print the vertex and its adjacency list
            console.log(i + " -> " + conc);
        }
    }
    dfs(startingNode, userinfo)
    {
        //console.log(startingNode) ;
        let ans=[];
        var visited = {} , vv={};
        vv[0]='y' ;
        for (let i=0 ;i<userinfo.length ;i++){
            
            let f1= userinfo[i].idCondition ;
            let f2= userinfo[i].answer ;
            vv[f1]=f2 ; 
        }
        
        return this.DFSUtil(startingNode, visited, vv, 0);
    }
    
    // Recursive function which process and explore
    // all the adjacent vertex of the vertex with which it is called
    
    DFSUtil(vert, visited, answered, ok)
    {
        visited[vert] = true;
    

        if (answered[vert]){
            if (answered[vert]=='y')  ok=1 ;
        }
        else {
            return vert ;
        }
        if (ok==1){

            var get_neighbours = this.AdjList.get(vert);
          
            for (var i in get_neighbours) {
                var get_elem = get_neighbours[i];
                let node =-1 ;
                if (!visited[get_elem]){
                    let r =this.DFSUtil(get_elem, visited,answered, 0);
                    if (r)return  r ;
                }
            }
        }
      
    }

}



/* -----------------------------------  */

function getSource (id)
{

        //id =111; 
    
        let queryString=`SELECT * FROM userbasicinfo where userid = ${id}`;
        let result = connection.query(queryString) ;
        let o=0 ;

        let langQuery ="(" ;
        for (i of result)
        {
            if (i.type==3)
            {
                
                if (o)langQuery+=',' ;
                o=1 ;
                langQuery += "'"+i.answer+"'"  ;
            }
        }
        langQuery+=')' ;
        o=0 ;
        let spQuery ="(" ;
        for (i of result)
        {
            if (i.type==2)
            {
                if (o)spQuery+=',' ;
                o=1 ;

                spQuery += "'"+i.answer+"'" ;
            }
        }
        spQuery+=')' ;
        o=0 ;
        let cityQuery ='(' ;
        for (i of result)
        {
            if (i.type==1)
            {
                if (o)cityQuery+=',' ;
                o=1 ;
                cityQuery +="'"+ i.answer+"'"  ;
            }
        }
       cityQuery +=')' ;
    
        if (cityQuery.length==2)
        {
            return -1 ;
            cityQuery="('NULL','L')" ;
        }
        if (spQuery.length==2)
        {
            return -2 ;
            spQuery="('NULL','L')" ;
        }
        if(langQuery.length==2)
        {
            return -3 ;
            langQuery="('english','L')" ;
        }
        queryString =`SELECT id FROM  major where city in ${cityQuery} and spNeed in ${spQuery} and lang in ${langQuery}` ;
        let source  = connection.query(queryString) ;
        return source ;
}


function buildTree (id ,source){

    //
    var g = new Graph(numberOfCondition+10);
    var vertices = [];
    let acc = [] ,acc2=[];

    let data =[] ;
    let cnt=0 ;
    vertices.push(0) ;
    g.addVertex(0);
    for (s of source)
    {
       let last =0 ;
       let here = connection.query(`SELECT  conditionID ,type, name FROM majorconditions where    majorID = ${s.id}`) ;
       for (j of here)
       {
            if (acc[j.conditionID]==1)continue ;
            vertices.push(j.conditionID) ;
            acc[j.conditionID]=1; 
            g.addVertex(j.conditionID);
       }
       for (j of here)
       {
            g.addEdge(last,  j.conditionID  ) ;
            console.log("node1 = " + last +" node2 = "+ j.conditionID ) ;
            last =  j.conditionID   ;
            acc2[j.conditionID]=1; 
       }
    }
    for (i of vertices)
    {
       console.log(i) ;
       var get_neighbours = g.AdjList.get(i);
       console.log(get_neighbours) ;
    }
    
    let userInfo = connection.query(`SELECT * FROM userinformation where id = ${id}`) ;
    ask =g.dfs(0,userInfo); 
   

    if (ask)return ask ;
    else return -1 ;

}
    


exports. getNextQuestion = async function getNextQuestion(req,res){
   
    let id =req.user.id ;
    //console.log("id"+id) ;

    let source= getSource(id) ;
    if (source==-1){
        res.send({"status":"no" , "msg":'Add a preferred city to the list of preferred city'}) ;
        return  ;
    }
    if (source==-2)
    {
        res.send({"status":"no" , "msg":'Add a preferred major to the list of preferred major'}) ;
        return  ;
    }
    if (source==-3)
    {
        res.send({"status":"no" , "msg":'Add a preferred language to the list of preferred languages'}) ;
        return  ;
    }
    console.log("source =") ;
    console.log(source) ;
    let ask = buildTree(req.user.id,source) ;
    let ok =0 ;
    if (ask)
    {
        let conditions = connection.query('SELECT id,name FROM conditionsname') ;
        for (i of conditions)nameFromId[i.id]=i.name ;
        console.log("the next question is " + ask ) ;
        res.send({"status":"yes" ,"id":ask , "question" :nameFromId[ask]} ) ;
      

        ok =1 ;

     
    }    
    if (ok == 0 ) res.send({"status":"no","msg":"the next question is NULL "}) ;
}


/* -----------------------------------  */

function getMajor (id){
    //id =111; 

    let queryString=`SELECT * FROM userbasicinfo where userid = ${id}`;
    let result = connection.query(queryString) ;
    let o=0 ;

    let langQuery ="(" ;
    for (i of result)
    {
        if (i.type==3)
        {
            
            if (o)langQuery+=',' ;
            o=1 ;
            langQuery += "'"+i.answer+"'"  ;
        }
    }
    langQuery+=')' ;
    o=0 ;
    let spQuery ="(" ;
    for (i of result)
    {
        if (i.type==2)
        {
            if (o)spQuery+=',' ;
            o=1 ;

            spQuery += "'"+i.answer+"'" ;
        }
    }
    spQuery+=')' ;
    o=0 ;
    let cityQuery ='(' ;
    for (i of result)
    {
        if (i.type==1)
        {
            if (o)cityQuery+=',' ;
            o=1 ;
            cityQuery +="'"+ i.answer+"'"  ;
        }
    }
    cityQuery +=')' ;
    console.log(cityQuery) ;
    console.log(spQuery) ;
    console.log(langQuery) ;
    if (cityQuery.length==2)
    {
        return -1 ;
        cityQuery="('NULL','L')" ;
    }
    if (spQuery.length==2)
    {
        return -2 ;
        spQuery="('NULL','L')" ;
    }
    if(langQuery.length==2)
    {
        return -3 ;
        langQuery="('english','L')" ;
    }
    queryString =`SELECT * FROM  major where city in ${cityQuery} and spNeed in ${spQuery} and lang in ${langQuery}` ;
    let source  = connection.query(queryString) ;
 
    return source ;
} 
exports.getScholar =(req,res)=>{
        let userId    = req.user.id ;

        let result2 =  connection.query(`SELECT idCondition	,answer	 FROM userinformation where id = ${userId} `) ;
        let userInfo={} ;
        
        for (x of result2)
        {
            userInfo[x.idCondition]=x.answer ;
        }
        

        let source = getMajor(userId) ;

        if (source==-1){
            res.send({"status":"no" , "msg":'Add a preferred city to the list of preferred languages'}) ;
            return  ;
        }
        if (source==-2)
        {
            res.send({"status":"no" , "msg":'Add a preferred major to the list of preferred languages'}) ;
            return  ;
        }
        if (source==-3)
        {
            res.send({"status":"no" , "msg":'Add a preferred language to the list of preferred languages'}) ;
            return  ;
        }

        let resp = [],  ac=[];
        
        for (s of source)
        {
            
            let ress = connection.query(`SELECT conditionID,type FROM majorconditions where majorID = ${s.id} `) ;
            let cnt =0;  let no =0 ;
            let ma={} ;
        
            
            for (con of ress)
            {
                
                if (userInfo[con.conditionID])
                {
                    if (userInfo[con.conditionID]=='y')cnt++ ;
                    else {
                        no=1 ;
                        break ;
                    }
                }
                else break ;
                
            }
            if(no)continue  ;

            
            if ( ac[sFromm [s.title]]==1)continue ;
            resp.push( scholarshipsFromId[sFromm [s.title]]) ;
            ac[sFromm [s.title]]=1 ;
            
        }
        res.send(resp) ;

}


/* -----------------------------------  */


exports.addanswer =(req,res)=>{
    let userId    = req.user.id ;
    let questionId= req.body.id ;
    let answer    = req.body.answer ;
    answer= answer.toLowerCase() ;
    pool.getConnection((err ,Connection)=>{

        if(err)throw err ;

        Connection.query('INSERT INTO userinformation  SET id=?	,answer=?,	idCondition=? ',[userId,answer,questionId],(err )=>{
            res.send({"msg":"ok"}) ;
            Connection.release() ;

            if(err)throw err ;
            
            //res.redirect('/');
        })
        

    }) ;
    
    
}
exports.remoanswer =(req,res)=>{
        let userId = req.user.id ;
        let qId    = req.body.questionId ;
      
        pool.getConnection((err ,Connection)=>{

            if(err)throw err ;
    
            Connection.query('DELETE  from userinformation  where id=?	and idCondition=? ',[userId ,qId],(err )=>{
                res.send({"msg":"ok"}) ;
                Connection.release() ;
    
                if(err)throw err ;
                
                //res.redirect('/');
            })
            
    
        }) ;

}




exports.getData =(req, res)=>{
     
        let userId = req.user.id ;

        //userinformation
        //userbasicinfo
        let result1 = connection.query(`SELECT type , answer FROM userbasicinfo where  userID = ${userId} `) ;
        let result2 = connection.query(`SELECT idCondition	,answer	 FROM userinformation where id = ${userId} `) ;
        let respon ={
             'country' : [] ,
             'major' : [],
             'language':[]
        }
        let respon2=[];
        for (x of result1)
        {
            respon[typeA[x.type]].push(x.answer) ;
        }
        for (x of result2)
        {
         
            respon2.push({"id":x.idCondition ,"text": nameFromId[x.idCondition] ,"answer":x.answer}) ;
        }
        res.send( {"id":req.user.id,"name": req.user.name,"email":req.user.email ,"basic" :respon , "ques" : respon2} ); 

}


{
exports.addlang =(req,res)=>{
       //

       let userId    = req.user.id ;
       let lan = req.body.language ;

       lan= lan.toLowerCase() ;
       connection.query( `INSERT INTO userbasicinfo (userID, type, answer) VALUES (${userId}, '3', "${lan}")` ) ;
        res.send({"status":"ok"});
}
exports.addmajor =(req,res)=>{
    let userId    = req.user.id ;
    let sp = req.body.major ;
    sp= sp.toLowerCase() ;
    connection.query( `INSERT INTO userbasicinfo (userID, type, answer) VALUES (${userId}, '2', "${sp}")` ) ;
    res.send({"status":"ok"});

}
exports.addcity =(req,res)=>{
    let userId    = req.user.id ;
    let want = req.body.city ;
     want= want.toLowerCase() ;
    connection.query( `INSERT INTO userbasicinfo (userID, type, answer) VALUES (${userId}, '1', "${want}")` ) ;
    res.send({"status":"ok"});

}
exports.remolang =(req,res)=>{
    let userId    = req.user.id ;
    let lan = req.body.language ;
    connection.query( `DELETE FROM userbasicinfo WHERE userid=${userId} and answer="${lan}"` ) ;
    res.send({"status":"ok"});

}
exports.remomajor =(req,res)=>{
    let userId    = req.user.id ;
    let major = req.body.major ;
    connection.query( `DELETE FROM userbasicinfo WHERE userid=${userId} and answer="${major}"` ) ;
    res.send({"status":"ok"});

}
exports.remocity =(req,res)=>{
    let userId    = req.user.id ;
    let want = req.body.city ;
    connection.query( `DELETE FROM userbasicinfo WHERE userid=${userId} and answer="${want}"` ) ;
    res.send({"status":"ok"});

}

     
}



