const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config')
const {ensureLoggedIn} = require('../middleware/auth');



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login',async (req,res,next) => {
    try{
        const { username, password } = req.body;
        if( !username || !password ){
            return next(new ExpressError("Username and password are required",404))
        }
        if(await User.authenticate(username,password)){
            let token = jwt.sign({ username }, config.SECRET_KEY);
            return res.json({message:"logged in!", token});
        }else{
            return next(new ExpressError("Invalid User/Password",404))
        }

    }catch(e){
        return next(e);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register',async (req,res,next) => {
    try{
        const { username , password , first_name, last_name , phone } = req.body;
        let user = await User.register({username,password,first_name,last_name,phone});
        let payload = {username};
        let token = jwt.sign(payload,config.SECRET_KEY);
        console.log(token);
        return res.status(201).json(user);


    }catch(e){
        if(e.code === '23505'){
            return next(new ExpressError('Username Taken',400))
        }
        return next(e);

    }

})




module.exports = router;