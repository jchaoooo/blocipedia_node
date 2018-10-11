const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

describe("Wiki", () => {
  beforeEach((done) => {
    this.user;
    this.post;
    sequelize.sync({force:true}).then((res) => {
      User.create({
        username: "bobdole",
        email: "user@example.com",
        password: "1234567890"
      })
      .then((user) => {
        this.user = user;

        Wiki.create({
          title: "Learn to code",
          body: "Coding is a fun pasttime",
          private: false,
          userId: this.user.id
        })
        .then((wiki) => {
          this.wiki = wiki;
          done();
        });
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe("#create()", () => {
    it("should create a wiki object with a title, body, private boolean, and assigned user", (done) => {
      Wiki.create({
        title: "Learn to code",
        body: "Coding is a fun pasttime.",
        private: false,
        userId: this.user.id
      })
      .then((wiki) => {
        expect(wiki.title).toBe("Learn to code");
        expect(wiki.body).toBe("Coding is a fun pasttime.");
        expect(wiki.private).toBe(false);
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should not create a post with missing title, body, private boolean, or assigned user", (done) => {
      Wiki.create({
        title: "Learn to code"
      })
      .then((wiki) => {
        done();
      })
      .catch((err) => {
        expect(err.message).toContain("Wiki.body cannot be null");
        expect(err.message).toContain("Wiki.private cannot be null");
        expect(err.message).toContain("Wiki.userId cannot be null");
        done();
      });
    });
  });

  describe("setUser()", () => {
    it("should associate a user and a wiki together", (done) => {
      User.create({
        username: "jimmyjohn",
        email: "user2@example.com",
        password: "hotdogs"
      })
      .then((newUser) => {
        expect(this.wiki.userId).toBe(this.user.id);
        this.wiki.setUser(newUser)
        .then((wiki) => {
          expect(wiki.userId).toBe(newUser.id);
          done();
        });
      });
    });
  });

  describe("getUser()", () => {
    it("should return the associated user", (done) => {
      this.wiki.getUser()
      .then((associatedUser) => {
        expect(associatedUser.username).toBe("bobdole");
        done();
      });
    });
  });
});
