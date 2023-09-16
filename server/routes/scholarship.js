
const express = require ('express') ;
const router  = express.Router() ;
const scholarshipController = require('../controllers/scholarshipController.js') ;


//route !! 


router.get('/getall',scholarshipController.getAll) ;
router.post('/getmajors',scholarshipController.getMajor) ;


router.use((req,res,next)=>{

        console.log(req.rule) ;
       if (req.rule=='admin')next() ;
      else res.send({msg:"you not allowed to use this route"}) ;
})



router.post('/getcoditions',scholarshipController.getCondition) ;

router.post('/addscholar',scholarshipController.addscholar) ;
router.post('/addmajor',scholarshipController.addmajor) ;
router.post('/addcondition',scholarshipController.addcondition) ;

router.post('/removescholar',scholarshipController.removescholar) ;
router.post('/removemajor',scholarshipController.removemajor) ;
router.post('/removecondition',scholarshipController.removecondition) ;

/*


*/
/*

router.post('/editscholar',scholarshipController.editscholar) ;
router.post('/editmajor',scholarshipController.) ;editmajor
router.post('/editcondition',scholarshipController.editcondition) ;


*/


module.exports = router ;
/*

{
    "title":"منحة إيرا فرانسيس ديفيز الدراسية الممولة بالكامل" ,
    "contain":"منحة إيرا فرانسيس ديفيز الدراسية هي منحة دراسية كاملة الرسوم الدراسية تمنح عادة لطالبة واحدة متميزة في كل عام دراسي. يجب أن يكون الطالب مواطنا ومقيما في بلد نام مؤهل ، والذي يتابع برنامج الماجستير للدراسات العليا داخل كلية الطب والصحة وعلوم الحياة.",
    "startDate":"21/7/2024",
    "expiryDate":"21/12/2024"
}



*/
