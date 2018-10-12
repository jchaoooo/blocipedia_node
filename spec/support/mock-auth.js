module.exports = {

// #1
  fakeIt(app){
// #2
    let username, id, email, role, private;

// #3
    function middleware(req,res,next){

// #4
      username = req.body.username || username;
      id = req.body.userId || id;
      email = req.body.email || email;
      role = req.body.role || role;
      private = req.body.private || private

// #5
      if(id && id != 0){
        req.user = {
          "id": id,
          "email": email,
          "username": username,
          "role": role,
          "private": private
        };
      } else if(id == 0) {
        delete req.user;
      }

      if( next ){ next() }
    }

// #6
    function route(req,res){
      res.redirect("/")
    }

// #7
    app.use(middleware)
    app.get("/auth/fake", route)
  }
}
