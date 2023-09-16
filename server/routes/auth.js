const express = require("express");
const authController = require("../controllers/auth.js");

const router = express.Router();





router.get('/register', (req, res) => {   res.sendFile("register.html", { root: './public/' })});
router.get('/login', (req, res) => {    res.sendFile("login.html", { root: './public/' })});


router.post('/register', authController.register)
router.post('/login', authController.login);
router.get('/logout', authController.logout);


router.use('/',authController.isLoggedIn);
router.get('/',(req,res)=>{
    res.send("HI " + req.user.name) ;
})





module.exports = router;