const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config');
const {ensureLoggedIn,ensureCorrectUser} = require('../middleware/auth');


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', ensureLoggedIn, async (req,res,next) => {
    try{
        const users = await User.all();
        return res.json(users);
    }catch(e){
        return next(e);
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username',ensureLoggedIn,ensureCorrectUser,async (req,res,next) => {
    try{
        const user = await User.get(req.params.username);
        if(user){
            return res.json(user)
        }
        throw new ExpressError("user not found!", 404);
        
    }catch(e){
        return next(e);

    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to',ensureLoggedIn,ensureCorrectUser, async (req,res,next) => {
    try{
        let messages = await User.messagesTo(req.params.username);
        return res.json(messages);

    }catch(e){
        return next(e);

    }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from',ensureLoggedIn,ensureCorrectUser, async (req,res,next) => {
    try{
        let messages = await User.messagesFrom(req.params.username);
        return res.json(messages);

    }catch(e){
        return next(e);
    }
})

module.exports = router;