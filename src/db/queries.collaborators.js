const Collaborator = require("./models").Collaborator;
const Wiki = require("./models").Wiki;
const User = require("./models").User;
const Authorizer = require("../policies/application");

module.exports = {
  createCollaborator(req, callback) {
    User.findOne({
      where: {
        name: req.body.collaborator
      }
    })
    .then((user) => {
      if(!user) {
        return callback("User does not exist")
      }
      Collaborator.findOne({
        where: {
          userId: user.id,
          wikiId: req.params.wikiId
        }
      })
      .then((collaborator) => {
        if(collaborator) {
          return callback("This user is already a collaborator on this wiki")
        }
        let (newCollaborator) = {
          userId: user.id,
          wikiId: req.params.wikiId
        };
        return Collaborator.create(newColloaborator)
        .then((collaborator) => {
          callback(null, collaborator);
        })
        .catch((err) => {
          callback(err, null)
        })
      })
    })
  }

}
