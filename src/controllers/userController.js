const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const User = require("../db/models").User;

const secretKey = process.env.SECRET_KEY;
const publicKey = process.env.PUBLISHABLE_KEY;
const stripe = require("stripe")(secretKey);


module.exports = {
  signUp(req, res, next) {
    res.render("users/sign_up");
  },

  create(req, res, next) {
    let newUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    userQueries.createUser(newUser, (err, user) => {
      if(err) {
        req.flash("notice", "Email or username already exists");
        res.redirect("/users/sign_up");
      } else {
        passport.authenticate("local")(req, res, () => {
          req.flash("notice", `You've successfully signed up, a confirmation email has been sent!`);
          res.redirect("/");
        })
      }
    });
  },

  signInForm(req, res, next) {
    res.render("users/sign_in");
  },

  signIn(req, res, next) {
    passport.authenticate("local")(req, res, function() {
      if(!req.user) {
        req.flash("notice", "Sign in failed. Please try again.");
        res.redirect("/users/sign_in");
      } else {
        req.flash("notice", "You've successfully signed in");
        res.redirect("/")
      }
    })
  },

  signOut(req, res, next) {
    req.logout();
    req.flash("notice", "You've successfully signed out!");
    res.redirect("/");
  },

  show(req, res, next) {
    userQueries.getUser(req.params.id, (err, user) => {
      if(err || user === null) {
        req.flash("notice", "No user found with that ID");
        res.redirect("/");
      } else {
        res.render("users/show", {user});
      }
    })
  },

  upgradePage(req, res, next) {
    userQueries.getUser(req.params.id, (err, user) => {
      if(err || user === null) {
        req.flash("notice", "No user found with that ID");
      } else {
        res.render("users/upgrade", {user});
      }
    })
  },

  upgrade(req, res, next) {
    const token = req.body.stripeToken;
    const email = req.body.stripeEmail;
    User.findOne({
      where: {email: email}
    })
    .then((user) => {
      if(user) {
        const charge = stripe.charges.create({
          amount: 1500,
          currency: "USD",
          description: "Upgrade to Premium Membership",
          source: token,
          receipt_email: req.body.email
        })
        .then((result) => {
          if(result) {
            userQueries.toggleRole(user);
            req.flash("notice", "Congrats, you are now a Premium Member!");
            res.redirect("/");
          } else {
            req.flash("notice", "Somethings happened, the upgrade was unsuccessful");
            res.redirect("/users/show", {user})
          }
        })
      } else {
        req.flash("notice", "Upgrade unsuccessful");
        res.redirect("/users/upgrade")
      }
    })
  },

  downgradePage(req, res, next) {
    userQueries.getUser(req.params.id, (err, user) => {
      if(err || user === null) {
        req.flash("notice", "No user found with that ID");
      } else {
        res.render("users/downgrade", {user});
      }
    })
  },

  downgrade(req, res, next) {
    User.findOne({
      where: {id: req.params.id}
    })
    .then((user) => {
      if(user) {
        userQueries.toggleRole(user);
        req.flash("notice", "You are now a Standard Member");
        res.redirect("/");
      } else {
        req.flash("notice", "Something has happened, the downgrade was unsuccessful");
        res.redirect("/users/show", {user})
      }
    })
  }


}
