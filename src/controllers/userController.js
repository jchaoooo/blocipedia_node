const userQueries = require("../db/queries.users.js");
const wikiQueries = require("../db/queries.wikis.js");
const passport = require("passport");
const User = require("../db/models").User;

const secretKey = "sk_test_VOG1xUiVATaIMZYM4W3N891w";
const publicKey = process.env.PUBLISHABLE_KEY;
const stripe = require("stripe")("sk_test_VOG1xUiVATaIMZYM4W3N891w");


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
    User.findOne({
      where: {id: req.params.id}
    }) .then((user) => {
      stripe.customers.create({
          email: req.body.stripeEmail,
      }).then((customer) => {
        return stripe.customers.createSource(customer.id, {source: req.body.stripeToken})
      }).then((source) => {
        return stripe.charges.create({
          amount: 1500,
          currency: "USD",
          description: "Upgrade to Premium Membership",
          customer: source.customer
        });
      }).then((charge) => {
        if(charge) {
          let action = "upgrade";
          userQueries.toggleRole(user, action);
          req.flash("notice", "Congrats, you are now a Premium Member!");
          res.redirect("/");
        } else {
          req.flash("notice", "Somethings happened, the upgrade was unsuccessful");
          res.redirect("/users/show", {user})
        }
      })
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
        let action ="downgrade"
        userQueries.toggleRole(user, action);
        wikiQueries.makePublic(user);
        req.flash("notice", "You are now a Standard Member");
        res.redirect("/");
      } else {
        req.flash("notice", "Something has happened, the downgrade was unsuccessful");
        res.redirect("/users/show", {user})
      }
    })
  },

  showCollaborations(req, res, next) {
    console.log(req.user.id);
    userQueries.getUser(req.user.id, (err, result) => {
      user = result["user"];
      collaborations = result["collaborations"];
      if(err || user == null) {
          res.redirect(404, "/");
      } else {
          res.render("users/collaborations", {user, collaborations});
          }
    });
  }


}
