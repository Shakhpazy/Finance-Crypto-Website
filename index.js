import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import paginate from "express-paginate";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import { coinmarketcap } from "./CoinMarketCap.js";

env.config();

const PORT = process.env.PORT || 3000;
const app = express();

// --------------------------------------------
// EJS setup & middleware
// --------------------------------------------
app.set("view engine", "ejs");
app.use(paginate.middleware(10, 100));
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------------------------------------------
// Session & Passport
// --------------------------------------------
const SALTROUNDS = Number(process.env.SALT_ROUNDS) || 10;

app.use(
  session({
    secret: process.env.SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// --------------------------------------------
// DATABASE CONNECTION (auto-switch for local/Render)
// --------------------------------------------

const { Pool } = pg;

function createPool() {
  // Automatically pick direct connection when running locally
  const dbUrl = process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;

  console.log("🔗 Connecting to database:", dbUrl.includes("pooler") ? "Using pooled (Render)" : "Using direct (local)");

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 60000,
  });

  pool.on("error", (err) => {
    console.error("⚠️ PG pool error:", err.message);
  });

  return pool;
}

let db = createPool();

// Health check route (for Render)
app.get("/health", (req, res) => res.status(200).send("OK"));

// Keepalive + reconnect every 5 min
setInterval(async () => {
  try {
    await db.query("SELECT 1");
    console.log("🫀 DB connection alive");
  } catch (err) {
    console.error("⚠️ DB heartbeat failed:", err.message);
    db = createPool(); // reconnect cleanly
  }
}, 5 * 60 * 1000);

const API = new coinmarketcap();

// --------------------------------------------
// TEST ROUTE
// --------------------------------------------
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ message: "✅ Database connected!", time: result.rows[0] });
  } catch (err) {
    console.error("❌ DB test failed:", err.message);
    res.status(500).json({ message: "Database connection failed", error: err.message });
  }
});

// --------------------------------------------
// ROUTES
// --------------------------------------------
app.get("/", async (req, res) => {
  try {
    const theData = (await db.query("SELECT * FROM coins ORDER BY market_cap DESC LIMIT 20")).rows;
    res.render("index.ejs", { data: theData, crypto1: undefined, crypto2: undefined, user: req.user });
  } catch (error) {
    console.error("DB query failed:", error.message);
    res.render("index.ejs", { data: [], crypto1: undefined, crypto2: undefined, user: req.user });
  }
});

app.get("/portfolio", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.render("portfolioblank.ejs", { user: req.user });
  }

  const user = req.user;
  try {
    const result = await db.query(
      "SELECT * FROM portfolio INNER JOIN coins ON portfolio.coin_id = coins.cmc_id WHERE user_id = $1",
      [user.id]
    );
    const entries = result.rows;
    const total = entries.reduce((sum, e) => sum + e.price * e.amount, 0);
    res.render("portfolio.ejs", { user, total, entries });
  } catch (error) {
    console.error("Portfolio query failed:", error.message);
    res.render("portfolio.ejs", { user, total: 0, entries: [] });
  }
});

app.get("/cryptocurrency", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const pageCount = Math.ceil(1000 / 10);

    const theData = (
      await db.query("SELECT * FROM coins ORDER BY market_cap DESC OFFSET $1 LIMIT $2", [offset, limit])
    ).rows;

    res.render("coinlist.ejs", {
      user: req.user,
      data: theData,
      pageCount,
      currentPage: page,
      pages: Array.from({ length: pageCount }, (_, i) => i + 1),
    });
  } catch (error) {
    console.error("Coin list query failed:", error.message);
    res.render("coinlist.ejs", { user: req.user, data: [], pageCount: 0, currentPage: 1, pages: [] });
  }
});

app.get("/search", async (req, res) => {
  const search = req.query.q || "";
  const symbol = search.toUpperCase();
  const name = search.charAt(0).toUpperCase() + search.slice(1).toLowerCase();

  try {
    const result = await db.query(
      "SELECT * FROM coins WHERE name ILIKE $1 OR symbol ILIKE $2 ORDER BY market_cap DESC",
      [`%${name}%`, `%${symbol}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Search failed:", error.message);
    res.status(500).send("Error querying the database.");
  }
});

app.get("/coin/:coin", async (req, res) => {
  try {
    const theData = (await db.query("SELECT * FROM coins WHERE name = $1", [req.params.coin])).rows[0];
    if (!theData) {
      console.log("Coin not found");
      return res.redirect("/");
    }
    res.render("coin.ejs", { data: theData, user: req.user });
  } catch (error) {
    console.error("Coin fetch failed:", error.message);
    res.redirect("/");
  }
});

app.get("/register", (req, res) => res.render("register.ejs"));
app.get("/login", (req, res) => res.render("login.ejs"));

app.post("/portfolio", async (req, res) => {
  const { coin, amount, avg_buy_price, avg_sell_price } = req.body;
  const user = req.user;

  if (!coin || !amount || !avg_buy_price || !avg_sell_price) {
    console.log("Invalid portfolio inputs");
    return res.redirect("/portfolio");
  }

  try {
    const results = await db.query("SELECT * FROM coins WHERE name = $1", [coin]);
    if (results.rows.length > 0) {
      const coinID = results.rows[0].cmc_id;
      await db.query(
        "INSERT INTO portfolio (amount, avg_buy, user_id, coin_id, avg_sell) VALUES ($1, $2, $3, $4, $5)",
        [parseFloat(amount), parseFloat(avg_buy_price), user.id, coinID, parseFloat(avg_sell_price)]
      );
    } else {
      console.log("Coin not found in DB");
    }
  } catch (error) {
    console.error("Portfolio insert failed:", error.message);
  }
  res.redirect("/portfolio");
});

app.post("/", async (req, res) => {
  const { fcoin1, fcoin2 } = req.body;
  try {
    const [theCrypto1, theCrypto2, theData] = await Promise.all([
      db.query("SELECT * FROM coins WHERE name = $1", [fcoin1]),
      db.query("SELECT * FROM coins WHERE name = $1", [fcoin2]),
      db.query("SELECT * FROM coins ORDER BY market_cap DESC LIMIT 20"),
    ]);

    if (!theCrypto1.rows[0] || !theCrypto2.rows[0]) {
      console.log("Invalid comparison input");
      return res.redirect("/");
    }

    res.render("index.ejs", {
      data: theData.rows,
      crypto1: theCrypto1.rows[0],
      crypto2: theCrypto2.rows[0],
      user: req.user,
    });
  } catch (error) {
    console.error("Compare failed:", error.message);
    res.redirect("/");
  }
});

app.post("/register", async (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  try {
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      console.log("Account exists");
      return res.redirect("/login");
    }

    const hash = await bcrypt.hash(password, SALTROUNDS);
    await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hash]);
    console.log("User registered");
    res.redirect("/login");
  } catch (error) {
    console.error("Register failed:", error.message);
    res.redirect("/register");
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect("/login");
    req.login(user, (err) => {
      if (err) return next(err);
      console.log("User authenticated");
      res.redirect("/");
    });
  })(req, res, next);
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// --------------------------------------------
// Passport Local Strategy
// --------------------------------------------
passport.use(
  new Strategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
        if (result.rows.length === 0) return done(null, false, { message: "User not found" });

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        return match ? done(null, user) : done(null, false, { message: "Incorrect password" });
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// --------------------------------------------
// Auto update crypto data every 15 min
// --------------------------------------------
setInterval(() => {
  console.log("⏱ Refreshing coin data...");
  API.fetchCryptoData(1000);
}, 15 * 60 * 1000);

// --------------------------------------------
// START SERVER
// --------------------------------------------
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;
export { db };
