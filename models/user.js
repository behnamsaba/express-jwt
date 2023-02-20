/** User class for message.ly */
const config = require('../config')
const bcypt = require('bcrypt');
const db = require('../db');
const ExpressError = require('../expressError');


/** User of the site. */

class User {
    constructor(username,password,first_name,last_name,phone,join_at,last_login_at){
        this.username=username;
        this.password=password;
        this.first_name=first_name;
        this.last_name=last_name;
        this.phone=phone;
        this.join_at=join_at;
        this.last_login_at=last_login_at;
    }
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hashedPassword = await bcypt.hash(password,12);
    let join_at = new Date().toISOString().slice(0, 10);
    let last_login_at = Date.now();

    const result = await db.query(
      `INSERT INTO users
      (username, password,first_name,last_name,phone,join_at,last_login_at)
      VALUES ($1,$2,$3,$4,$5,$6,current_timestamp)
      RETURNING username,password, first_name,last_name, phone`,
      [username,hashedPassword,first_name,last_name,phone,join_at]);

      return result.rows;

  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username=$1
      RETURNING *`,
      [username]
    );
    let user = result.rows[0];
    if(user){
        if(await bcypt.compare(password,user.password)){
            return true
        }}
    }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username=$1
      RETURNING *`,
      [username]
    );
    let user = result.rows[0];
    if(user){
      if(await bcypt.compare(password,user.password)){
          return true
      }}
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(`SELECT username,first_name,last_name,phone FROM users`);
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
        `SELECT username,first_name,last_name,phone,join_at,last_login_at
        FROM users WHERE username= $1`,
        [username]);
        console.log(result.rows);
        

        return result.rows[0];

  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
        `SELECT id,from_username,body,sent_at,read_at
        FROM messages WHERE from_username=$1`,
        [username]);
        return results.rows;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(`
    SELECT id,from_username,body,sent_at,read_at
    FROM messages WHERE to_username = $1`,
    [username]);
    return results.rows;
  }
}


module.exports = User;