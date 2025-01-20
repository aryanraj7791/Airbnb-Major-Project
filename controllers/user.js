const User = require("../models/user");

module.exports.renderSignUpForm = (req,res) => {
    res.render("users/signup.ejs");
};

module.exports.signUp = async (req,res) => {
    try{
        let { username,email,password } = req.body;
    let newUser = new User({
        email: email,
        username: username,
    });

    let registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "User registered successfully");
        res.redirect("/");
    });
    } catch(err){
        req.flash("error", `${err.message}`);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req,res) => {
    req.flash("success", "Welcome to Wanderlust. You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err){
          return next(err);
        }
        req.flash("success", "Logged out successfully!");
        res.redirect("/");
    })
};