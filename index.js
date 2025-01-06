import express, { query } from 'express'
import bodyParser from 'body-parser'
import pg from 'pg'
import env from 'dotenv'
import paginate from 'express-paginate'
//user auth and encryption
import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy } from 'passport-local'
import session from 'express-session'

//api
import { coinmarketcap } from './CoinMarketCap.js'

env.config()

const PORT = 3000
const app = express()

//pagination 10 items per page 100 pages
app.set('view engin', 'ejs')
app.use(paginate.middleware(10, 100))

//bcrypt for user db storage
const SALTROUNDS = Number(process.env.SALT_ROUNDS)

app.use(session({
    secret : "TOPSECRETWORD",
    resave : false,
    saveUninitialized: true,
  }));
  
  app.use(passport.initialize());
  app.use(passport.session())
//database connections
const db = new pg.Client({
    user: process.env.USER_DB,
    host: process.env.HOST_DB,
    database: process.env.DB_DB,
    password: process.env.PASS_DB,
    port: process.env.PORT_DB
})
db.connect()
export default db;

app.use(express.static("public")) 
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))

const API = new coinmarketcap();




app.get("/", async (req, res) => {
    // console.log("get main page")
    // console.log(req.user)
    let theData = []
    try {
        //api call to update the database --> then get all rows
        (await API.fetchCryptoData(1000))
        theData = (await db.query("SELECT * FROM coins ORDER BY market_cap DESC LIMIT 20")).rows  
    } catch (error) {
        console.log(error)
    }
    res.render("index.ejs", {data : theData, crypto1 : undefined, crypto2 : undefined, user : req.user})
})


app.get("/portfolio", async (req, res) => {
    console.log(req.user)
    if (req.isAuthenticated()) {
        const user = req.user
        let portolio_entries = []
        let total = 0
        try {
            portolio_entries = (await db.query('SELECT * FROM portfolio INNER JOIN coins ON portfolio.coin_id = coins.cmc_id WHERE user_id = $1', [user.id])).rows
            for (let i = 0; i < portolio_entries.length; i++) {
                total += (portolio_entries[i].price * portolio_entries[i].amount)
            }
        } catch (error) {
            console.log(error)
        }
        console.log(portolio_entries[0])
        console.log(total)
        res.render("portfolio.ejs", {user : req.user, total : total, entries : portolio_entries})
    }
    else {
        res.render("portfolioblank.ejs", {user : req.user})
    }
})

app.get("/cryptocurrency", async (req, res) => {
    let theData = []
    try {
        const limit = parseInt(req.query.limit) || 10
        const page = parseInt(req.query.page) || 1
        const offset = (page-1) * limit
        const pageCount = Math.ceil(1000 / 10)
        theData = (await db.query("SELECT * FROM coins ORDER BY market_cap DESC OFFSET $1 LIMIT $2", [offset, limit])).rows 
        res.render("coinlist.ejs", {
            user : req.user,
            data : theData,
            pageCount,
            currentPage: page,
            pages : Array.from({length: pageCount}, (_, i) => i + 1)
        })

    } catch (error) {
        console.log(error)
    }
    console.log(theData.length)
}) 

//search functionality
app.get("/search", async (req, res) => {
    const search = req.query.q; // user input from query parameters
    const symbol = search.toUpperCase();
    const name = search.charAt(0).toUpperCase() + search.slice(1).toLowerCase();
    try {
        const result = await db.query(`SELECT * FROM coins WHERE name LIKE '%${name}%' OR symbol LIKE '%${symbol}%' ORDER BY market_cap DESC`)
        
        res.json(result.rows)
    }
    catch (error) {
        res.status(500).send('Error querying the database.');
    }
})

app.get("/coin/:coin", async (req, res) => {
    console.log("get specific coin", req.params.coin)
    let theData = {}
    try {
        theData = (await db.query(`SELECT * FROM coins WHERE name = '${req.params.coin}'`)).rows[0]
    } catch (error) {
        console.log(error)
    }
    if (theData == undefined) {
        console.log("Coin not found")
        res.redirect("/")
    }

    res.render("coin.ejs", { data : theData, user : req.user })
})

app.get("/register", (req, res) => {
    res.render("register.ejs")
})

app.get("/login", (req, res) => {
    res.render("login.ejs")
})

app.post("/portfolio", async (req, res) => {
    const data = req.body
    const user = req.user
    const coinName = data.coin
    const coinAmount = parseFloat(data.amount)
    const avg_buy = parseFloat(data.avg_buy_price)
    const avg_sell = parseFloat(data.avg_sell_price)

    console.log("post about portfolio")
    console.log(coinName, coinAmount, avg_buy, avg_sell)

    if(!coinAmount || !avg_buy || !coinName || !avg_sell) {
        console.log("inputs may not be valid")
        res.redirect("/portfolio")
    }
    else {
        //check if the coin exists in the db
        try {
            const results = await db.query('SELECT * FROM coins WHERE name = $1', [coinName])
            if (results.rows.length >= 1) {
                const coinID = results.rows[0].cmc_id
                await db.query('INSERT INTO portfolio (amount, avg_buy, user_id, coin_id, avg_sell) VALUES ($1, $2, $3, $4, $5)',
                     [coinAmount, avg_buy, user.id, coinID, avg_sell]);
                res.redirect("/portfolio")
            }
            else {
                console.log("coin can't be found")
            }
        } catch (error) {
            console.log(error)
        }
    }

    //res.redirect("/portfolio")
})

app.post("/", async (req, res) => {
    console.log("post 2 coins")
    const data = req.body
    let theData = []
    let theCrypto1 = undefined
    let theCrypto2 = undefined
    console.log(data.fcoin1)
    console.log(data.fcoin2)
    try {
        theCrypto1 = (await db.query(`SELECT * FROM coins WHERE name = '${data.fcoin1}'`)).rows[0]
        theCrypto2 = (await db.query(`SELECT * FROM coins WHERE name = '${data.fcoin2}'`)).rows[0]
        theData = (await db.query("SELECT * FROM coins ORDER BY market_cap DESC LIMIT 20")).rows
    } catch (error) {
        console.log(error)
    }

    if (theCrypto1 == undefined || theCrypto2 == undefined) {
         console.log("API search not valid for one of the query")
         res.redirect("/")
     }


    res.render("index.ejs", {data : theData, crypto1 : theCrypto1, crypto2 : theCrypto2, user : req.user})  
})

app.post("/register", async (req, res) => {
    const email = req.body.email.toLowerCase()
    const password = req.body.password

    try {
        //check if email already in the system
        const results = await db.query('SELECT * FROM users where email = $1', [email])
        if (results.rows.length >= 1) {
            console.log("account exist")
            res.redirect("/login")
        }
        else {
            bcrypt.hash(password, SALTROUNDS, async function(err, hash) {
                if (err) {
                    console.log(err)
                } else {
                    await db.query('INSERT INTO users (email, password) VALUES($1, $2)', [email, hash])
                    console.log("user registered")
                    res.redirect("/")
                }  
            })
        }
    } catch (error) {
        console.log(error)
    }

})

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("Authentication error:", err);  // Log any errors
            return next(err);
        }
        if (!user) {
            console.log("Authentication failed:", info);  // Log failure reason
            if(info.message == "Incorrect password") {
                res.redirect("/login")
                return
            }
            else {
                res.redirect("/register")
                return
            }
        }
        req.login(user, (err) => {
            if (err) {
                console.error("Error during login:", err);
                return
            }
            console.log("User authenticated:");  // Log the authenticated user
            return res.redirect("/");  // Successful login, redirect
        });
    })(req, res, next);  
});

//should be a post but used a link 
app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})

passport.use(new Strategy({
    usernameField: 'email', 
    passwordField: 'password' 
  },
  async function (email, password, done) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
      if (result.rows.length === 0) {
        return done(null, false, { message: "User not found" });
      }

      const user = result.rows[0];
      const storedHashedPassword = user.password;

      bcrypt.compare(password, storedHashedPassword, (err, isMatch) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(null, user); 
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      });
    } catch (err) {
      return done(err); 
    }
  }
));

passport.serializeUser((user, done) => {
    done(null, user)
})
  
passport.deserializeUser((user, done) => {
    done(null, user)
})

app.listen(PORT, () => {
    console.log("Server Active runnnig Port: " + PORT)
})