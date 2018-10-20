const User = require("./models").User;
const bcrypt = require("bcryptjs");
const sgMail = require('@sendgrid/mail');
const Collaborator = require("./models").Collaborator;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  createUser(newUser, callback) {
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    return User.create({
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      const msg = {
        to: newUser.email,
        from: 'members@blocipedia.com',
        subject: "You've signed up with Blocipedia!",
        text: "Log in and start collaborating on wikis!",
        html: '<strong>Log in and start collaborating on wikis!</strong>'
      };
      sgMail.send(msg);
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  },

  getUser(id, callback) {
    let result = {};
    User.findById(id)
    .then((user) => {
      if(!user) {
        callback(404);
      } else {
        result["user"] = user;
        Collaborator.scope({ method: ["userCollaborationsFor", id]}).all()
        .then((collaborations) => {
          result["collaborations"] = collaborations;
          callback(null, result);
        })
        .catch((err) => {
          callback(err);
        })
      }
    })
  },

  toggleRole(user, action) {
    let newRole;
    User.findOne({
      where: {email: user.email}
    })
    .then((user) => {
      if(action === "upgrade") {
        newRole = "premium"
      } else if (action === "downgrade") {
        newRole = "standard";
      }
      user.update({
        role: newRole
      })
    })
  }


}
