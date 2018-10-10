const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const sgMail = require("@sendgrid/mail");

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
        req.flash("error", err);
        res.redirect("/users/sign_up");
      } else {
        passport.authenticate("local")(req, res, () => {
          req.flash("notice", "You've successfully signed up!");
          res.redirect("/");
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const msg = {
            to: newUser.email,
            from: `members@blocipedia.com`,
            subject: "You've signed up with Blocipedia!",
            text: "Log in and start collaborating on wikis!",
            html: '<strong>Log in and start collaborating on wikis!</strong>'
          };
          sgMail.send(msg);
        })
      }
    });
  },
}
