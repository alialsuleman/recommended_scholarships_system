const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const db = mysql.createConnection({
    
    host			:process.env.DB_HOST,
	user			:process.env.DB_USER,
	password		:process.env.DB_PASS,
	database		:process.env.DB_NAME,
});
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({
                message: "Please Provide an email and password"
            })
        }
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            console.log(results);
            if (!results || !await bcrypt.compare(password, results[0].password)) {
                res.status(401).send({
                    message: 'Email or Password is incorrect'
                })
            } else {
                const id = results[0].id;

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("the token is " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                console.log("Asd") ;
                res.cookie('userSave', token, cookieOptions);
                let ru="user" ;
                if (id==1)ru="admin" ;
                res.status(200).send({ message: 'ok' , rule :ru});
            }
        })
    } catch (err) {
        console.log(err);
    }
}

exports.register = (req, res) => {
    let msg="no";
    const { name, email, password, passwordConfirm } = req.body;
    db.query('SELECT email from users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.log(err);
        } else {
            if (results.length > 0) {
                msg="user is exist" ;
                
            } else if (password != passwordConfirm) {
                msg="wrong pass" ;
            }
        }
        if (msg!="no")
        {
            return res .status(200) .json({"ok":"NO" ,"msg": msg });
        }
        else {
            let hashedPassword = await bcrypt.hash(password, 8);
    
            db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword }, (err, results) => {
                if (err) {
                    console.log(err);
                } else {
                    if (msg=="no") return res .status(200)   .json({"ok":"YES","msg": msg });
                }
            })

        }

       
    })
  
    
}
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.userSave) {
        try {
            // 1. Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.userSave,
                process.env.JWT_SECRET
            );

            // 2. Check if the user still exist
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (err, results) => {
                if (!results) {
                    res.send({"status ":"login please"}) ;
                }
                req.user = results[0];
                if (results[0].id==1)req.rule = "admin" ;
                else req.rule = "user" ;
                
                return next();
            });
        } catch (err) {
            console.log(err)
            res.send({"status ":"login please"}) ;
        }
    } else {
        res.send({"status ":"login please"}) ;
    }
}
exports.logout = (req, res) => {
    res.cookie('userSave', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).send ({"msg":"ok"});
}