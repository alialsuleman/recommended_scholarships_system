const express = require ('express') ;
const router  = express.Router() ;
const userControllers = require('../controllers/userController.js') ;
const authController = require("../controllers/auth");



router.get("/sayhi" , (req,res)=>{
    res.send("hi "+ req.user.name+" :)") ;
})




//userControllers.getNextQuestion(111);


router.get('/getNextQuestion',userControllers.getNextQuestion) ;
router.post('/addanswer',userControllers.addanswer);
router.post('/remoanswer',userControllers.remoanswer)
router.get('/getscholar', userControllers.getScholar) ;
router.get('/getdata', userControllers.getData) ;
/* */
router.post('/addlang',userControllers.addlang) ;
router.post('/addmajor',userControllers.addmajor) ;
router.post('/addcity',userControllers.addcity); 

router.post('/remolang',userControllers.remolang) ;
router.post('/remomajor',userControllers.remomajor) ;
router.post('/remocity',userControllers.remocity) ;







/*

     

*/

//add user 
//getNextQuestion 
//deleteuser 
//editQuestion
//deleteQuestion 
//suggestSuitableScholarship



/*
router.post('/adduser', userControllers.create) ;

router.get('/viewuser/:id', userControllers.viewuser) ;

router.get('/edituser/:id', userControllers.edit) ;
router.post('/edituser/:id', userControllers.update) ;

router.get('/', userControllers.view) ;
router.post('/', userControllers.find) ;
router.get('/:id', userControllers.delete) ;

*/








module.exports = router ;




