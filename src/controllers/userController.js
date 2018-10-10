const userQueries = require("../db/queries.users.js");
const passport = require("passport");


module.exports = {
  signUp(req, res, next) {
    res.render("users/sign_up");
  },

  create(req, res, next) {
    let newUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    userQueries.createUser(newUser, (err, user) => {
      if(err) {
        req.flash("notice", "This email already exists");
        res.redirect("/users/sign_up");
      } else {
        passport.authenticate("local")(req, res, () => {
          req.flash("notice", `You've successfully signed up, a confirmation email has been sent!`);
          res.redirect("/");
        })
      }
    });
  },
}
