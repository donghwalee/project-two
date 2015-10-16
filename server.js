// VARIABLES

var express           = require('express'),
    router            = express.Router(),
    PORT              = process.env.PORT || 3000,
    server            = express(),
    MONGOURI          = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    dbname            = "projecttwo",
    mongoose          = require('mongoose'),
    Schema            = mongoose.Schema,
    ejs               = require('ejs'),
    morgan            = require('morgan'),
    methodOverride    = require('method-override'),
    bodyParser        = require('body-parser'),
    expressEjsLayouts = require('express-ejs-layouts'),
    session           = require('express-session'),
    bcrypt            = require('bcrypt');

// SCHEMAS

var userSchema = Schema({
  username: { type: String, required: true },
  passwordDigest: { type: String, required: true }
});

var User = mongoose.model("User", userSchema);

var Topic = mongoose.model("topic", {
  userid: String,
  // name: String,
  title: { type: String, maxlength: 150 },
  description: { type: String, maxlength: 300 },
  comments: [ String ],
  numComments: Number,
  likes: Number,
  created: Date,
  updated: Date
});

// SETS and USES

server.set('view engine', 'ejs');
server.set('views', './views');

server.use(session({
   secret: "dhl32877",
   resave: true,
   saveUninitialized: true
}));

server.use(morgan('dev'));
server.use(express.static('./public'));
server.use(expressEjsLayouts);
server.use(methodOverride('_method'));

server.use(bodyParser.urlencoded({ extended: true}));

server.use(function (req, res, next) {
   console.log("REQ DOT BODY:   ", req.body);
   console.log("REQ DOT SESSION:", req.session);
   next();
});

// SERVER GETS, POSTS, PATCHES AND DELETES

// LOGIN, LOGOUTS, AND REGISTER

server.get('/', function (req, res) {
  res.locals.currentuser = undefined;
  res.render('login');
});

server.get('/login', function (req, res) {
  res.locals.currentuser = undefined;
  res.render('login');
})

server.post('/logout', function (req, res) {
  req.session.currentUser = undefined;
  res.redirect(302, '/');
});

server.get('/register', function (req, res) {
  res.locals.currentuser = undefined;
  res.render('register');
});

// REGISTER W BCRYPT - from SHORTY's EXAMPLE

server.post('/register', function (req, res) {
  User.findOne({ username: req.body.user.username }, function (err, user) {
    if (err) {
      // error
      res.redirect(302, '/register');
    } else if (user) {
      // duplicate user id in use
      res.redirect(302, '/register/uidinuse');
    } else if (req.body.user.password !== req.body.user.passwordTwo) {
      res.redirect(302, '/register/pwdmismatch');
    } else {
      bcrypt.genSalt(10, function (saltErr, salt) {
        bcrypt.hash(req.body.user.password, salt, function (hashErr, hash) {
          var newUser = new User({
            username: req.body.user.username,
            passwordDigest: hash
          });
          newUser.save(function (saveErr, savedUser) {
            if (saveErr) {
              // error
              res.redirect(302, '/register');
            } else {
              res.redirect(302, '/register/success');
            }
          });
        });
      });
    }
  });
});

// REGISTER RESULTS

server.get('/register/success', function (req, res) {
  res.locals.currentuser = undefined;
  res.render('registersuccess');
});

server.get('/register/uidinuse', function (req, res) {
  res.locals.currentuser = undefined;
  res.render('registeruidinuse');
});

server.get('/register/pwdmismatch', function (req, res) {
  res.locals.currentuser = undefined;
  res.render('registerpwdmismatch');
});

// LOGIN W/ BCRYPT - from SHORTY's EXAMPLE

server.post('/login', function (req, res) {
  User.findOne({ username: req.body.user.username }, function (err, user) {
    if (err) {
      // error
      res.redirect(302, '/login/error');
    } else if (user) {
      bcrypt.compare(req.body.user.password, user.passwordDigest, function (compareErr, match) {
        if (match) {
          req.session.currentUser = user.username;
          res.redirect(302, '/topics');
        } else {
          // error
          res.redirect(302, '/login/error');
        }
      });
    } else {
      // error
      res.redirect(302, '/login/error');
    }
  });
});

// LOGIN RESULTS

server.get('/login/error', function (req, res) {
  res.locals.currentuser = undefined;
  res.render('loginagain');
});

// IF THERE IS NOT USER, THEN LOCK OUT OF OTHER PAGES

server.use(function (req, res, next) {
  if (req.session.currentUser == undefined) {
    res.redirect(302, '/');
  } else {
    res.locals.currentuser = req.session.currentUser;
    next();
  }
});

// TOPICS PAGES, BY DIFFERENT SORTING METHODS - DEFAULT = BY CREATION DATE

server.get('/topics', function (req, res) {
  Topic.find({}, null, {sort: '-created'}, function (err, allTopics) {
    if (err) {
      res.redirect('/login');
    } else {
      res.render('topics', {
        topics: allTopics
      });
    }
  });
});

server.get('/topics/byupdated', function (req, res) {
  Topic.find({}, null, {sort: '-updated'}, function (err, allTopics) {
    if (err) {
      res.redirect('/login');
    } else {
      res.render('topics', {
        topics: allTopics
      });
    }
  });
});

server.get('/topics/bylikes', function (req, res) {
  Topic.find({}, null, {sort: '-likes'}, function (err, allTopics) {
    if (err) {
      res.redirect('/login');
    } else {
      res.render('topics', {
        topics: allTopics
      });
    }
  });
});

server.get('/topics/bycomments', function (req, res) {
  Topic.find({}, null, {sort: '-numComments'}, function (err, allTopics) {
    if (err) {
      res.redirect('/login');
    } else {
      res.render('topics', {
        topics: allTopics
      });
    }
  });
});

// TOPICS PAGES

server.post('/topics', function (req, res) {
  var today = new Date();
  var topic = new Topic({
    userid: req.session.currentUser,
    title: req.body.topic.title,
    description: req.body.topic.description,
    comments: [],
    numComments: 0,
    likes: 0,
    created: today,
    updated: today
  });
  topic.save(function (err, newTopic) {
    if (err) {
        // where should they go for errors???
        res.redirect(302, '/error');
      } else {
        res.redirect(302, '/topics');
      }
  });
});

server.get('/topics/:id/edit', function (req, res) {
  var topicID = req.params.id;
  Topic.findOne({
    _id: topicID
  }, function (err, foundTopic) {
    if (err) {
      // where should they go for errors???
      res.redirect(302, '/error');
    } else {
       res.render('edittopic', {
          topic: foundTopic
       });
    }
  });
});

server.patch('/topics/:id/', function (req, res) {
  var topicID = req.params.id;
  var topicParams = req.body.topic;

  Topic.findOne({
    _id: topicID
  }, function (err, foundTopic) {
    if (err) {
      // where should they go for errors???
      res.redirect(302, '/error');
    } else {
       foundTopic.update(topicParams, function (errTwo, topics) {
         if (errTwo) {
           console.log("error updating");
         } else {
           console.log("updated");
           res.redirect(302, '/topics');
         }
       });
    }
  });
});

server.patch('/topics/:id/newcomment/:commentlength', function (req, res) {
  var today = new Date();
  var topicID = req.params.id;
  var currentComments = eval(req.params.commentlength) + 1;
  var newComment = '(Comment by: ' + res.locals.currentuser + ' | on: ' + today + ') "' + req.body.topic.newcomment + '"';
  console.log("TEST", newComment);

  Topic.findOneAndUpdate({
    _id: topicID
    }, {
      $push: {comments: [newComment]}
    }, {
      safe: true,
      upsert: true
    }, function (err, model) {
      if (err) {
        // where should they go for errors???
        res.redirect(302, '/error');
    } else {
      Topic.findOneAndUpdate({
        _id: topicID
      },
      {numComments: currentComments}
      , {
        safe: true,
        upsert: true
      },
       function (err, model) {
          if (err) {
            // where should they go for errors???
            res.redirect(302, '/error');
        } else {
          Topic.findOneAndUpdate({
            _id: topicID
          },
          {updated: today}
          , {
            safe: true,
            upsert: true
          },
           function (err, model) {
              if (err) {
                // where should they go for errors???
                res.redirect(302, '/error');
            } else {
              res.redirect(302, '/topics/' + topicID);
            }
          }
          );
        }
      }
      );
    }
  }
  );
});


server.patch('/topics/:id/like/:nolikes/', function (req, res) {
  console.log("I'm at least here...", req.params);
  var topicID = req.params.id;
  var currentLikes = eval(req.params.nolikes) + 1;

  Topic.findOneAndUpdate({
    _id: topicID
  },
  {likes: currentLikes}
  , {
    safe: true,
    upsert: true
  },
   function (err, model) {
      if (err) {
        // where should they go for errors???
        res.redirect(302, '/error');
    } else {
      res.redirect(302, '/topics/' + topicID);
    }
  }
  );
});

server.delete('/topics/:id', function (req, res) {
  var topicID = req.params.id;
  Topic.remove({
    _id: topicID
  }, function (err) {
    if (err) {
      // where should they go for errors???
      res.redirect(302, '/error');
    } else {
      res.redirect(302, '/topics');
    }
  });
});

// NO LONGER NEEDED BECAUSE OF SLIDEDOWN METHOD

// server.get('/topics/new', function (req, res) {
//   res.render('newtopic' );
// });

// VIEW BY USERS

server.get('/users/:id', function (req, res) {
  console.log("can you see me?");
  console.log(req.params.id);
  var particularUser = req.params.id;
  Topic.find({
    userid: particularUser
  }, null, {sort: '-created'}, function (err, userTopics) {
    if (err) {
      // where should they go for errors???
      res.redirect(302, '/error');
    } else {
      res.render('usertopics', {
        userid: particularUser,
        topics: userTopics
      });
    }
  });
});

server.get('/users/:id/byupdated', function (req, res) {
  console.log("can you see me?");
  console.log(req.params.id);
  var particularUser = req.params.id;
  Topic.find({
    userid: particularUser
  }, null, {sort: '-updated'}, function (err, userTopics) {
    if (err) {
      // where should they go for errors???
      res.redirect(302, '/error');
    } else {
      res.render('usertopics', {
        userid: particularUser,
        topics: userTopics
      });
    }
  });
});

server.get('/users/:id/bycomments', function (req, res) {
  console.log("can you see me?");
  console.log(req.params.id);
  var particularUser = req.params.id;
  Topic.find({
    userid: particularUser
  }, null, {sort: '-numComments'}, function (err, userTopics) {
    if (err) {
      // where should they go for errors???
      res.redirect(302, '/error');
    } else {
      res.render('usertopics', {
        userid: particularUser,
        topics: userTopics
      });
    }
  });
});

server.get('/users/:id/bylikes', function (req, res) {
  console.log("can you see me?");
  console.log(req.params.id);
  var particularUser = req.params.id;
  Topic.find({
    userid: particularUser
  }, null, {sort: '-likes'}, function (err, userTopics) {
    if (err) {
      // where should they go for errors???
      res.redirect(302, '/error');
    } else {
      res.render('usertopics', {
        userid: particularUser,
        topics: userTopics
      });
    }
  });
});

// TOPICS AGAIN?

server.get('/topics/:id/', function (req, res) {
  console.log(req.params.id);
  Topic.findById(req.params.id, function (err, particularTopic) {
    if (err) {
      // where should they go for errors???
      res.redirect(302, '/error');
    } else {
      res.render('comments', {
        topic: particularTopic
      });
    }
  });
});

// NO LONGER NEEDED BECAUSE OF SLIDEDOWN FUNCTION

// server.post('/topics/:id/newcomment', function (req, res) {
//   var topicID = req.params.id;
//   console.log("here, here...");
//   Topic.findOne({
//     _id: topicID
//   }, function (err, foundTopic) {
//     if (err) {
//       // where should they go for errors???
//       res.redirect(302, '/topics');
//     } else {
//        res.render('newcomment', {
//           topic: foundTopic
//        });
//     }
//   });
// });

// errors

server.get('/error', function (req, res) {
  res.render('errors');
});

// catchall as a last resort (needed?)

server.use(function (req, res, next) {
  res.render('errors');
});

mongoose.connect(MONGOURI + "/" + dbname);
server.listen(PORT, function () {
  console.log("SERVER IS UP ON PORT: ", PORT);
});
