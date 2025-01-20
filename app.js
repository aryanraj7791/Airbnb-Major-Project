if(process.env.NODE_ENV != "production"){
   require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("express-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(methodOverride("_method"));

const db_url = process.env.MONGOATLAS_URL;

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main(){
    mongoose.connect(db_url);
};

app.use(cookieParser());
app.use(flash());

const store = MongoStore.create({
    mongoUrl: db_url,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page not found!"));
})

//Custom error handler middleware
app.use((err,req,res,next) => {
    let { statusCode = 500, message = "An unexpected error occured!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log(`Server is listening on port 8080`);
});