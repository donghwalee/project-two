// variables

var express           = require('express'),
    router            = express.Router(),
    PORT              = process.env.PORT || 3000,
    // PORT              = 3000,
    server            = express(),
    MONGOURI          = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    // MONGOURI          = "mongodb://localhost:27017",
    dbname            = "projecttwo",
    mongoose          = require('mongoose'),
    Schema            = mongoose.Schema,
    ejs               = require('ejs'),
    morgan            = require('morgan'),
    methodOverride    = require('method-override'),
    bodyParser        = require('body-parser'),
    expressEjsLayouts = require('express-ejs-layouts'),
    session           = require('express-session');

// schema version 1

// var Topic = mongoose.model("topic", {
//   userid: String,
//   // name: String,
//   title: String,
//   description: { type: String, maxlength: 500 }
// });

// schema version 2

var userSchema = Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

var User = mongoose.model("User", userSchema);


var Topic = mongoose.model("topic", {
  userid: String,
  // name: String,
  title: String,
  description: { type: String, maxlength: 500 },
  comments: [ String ],
  numComments: Number,
  likes: Number
  // date created
  // date last updated?
});

// var newTopic = new Topic({
//   name: "Topic 1",
//   description: "Let's start talking about topic 1!!"
// });
//
// newTopic.save(function (err, topic) {
//   if (err) {
//     console.log("There was an error saving...");
//     console.log(err);
//   } else {
//     console.log("Topic saved");
//     console.log(topic);
//   }
// })



// server set and uses

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

//


server.use(function (req, res, next) {
   console.log("REQ DOT BODY", req.body);
   console.log("REQ DOT SESSION", req.session);
   next();
});


// from the user creation:
// var userController = require('./controllers/users.js');
// server.use('/users', userController);



// server.get('/super-secret-test', function (req, res) {
//   res.write("Welcome to my amazing app");
//   res.end();
// });

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

server.post('/register', function (req, res) {
  var newUser = User(req.body.user);

  newUser.save(function (err, user) {
    res.redirect(301, 'login');
  });
});

// server.get('/users/:id', function (req, res) {
//   User.findById(req.params.id, function (err, user) {
//     console.log(user);
//   });
// });

server.post('/login', function (req, res) {
  // req.session.currentUser = req.body.currentUser;
  // res.redirect(302, '/topics');
  var attempt = req.body.user;
  User.findOne({ username: attempt.username }, function (err, user) {
    if (user && user.password === attempt.password) {
      req.session.currentUser = user.username;
      res.redirect(301, '/topics');
    } else {
      res.redirect(301, 'login');
    }
  });
});

server.use(function (req, res, next) {
  if (req.session.currentUser == undefined) {
    res.redirect(302, '/');
  } else {
    res.locals.currentuser = req.session.currentUser;
    next();
  }
});

server.get('/topics', function (req, res) {
  Topic.find({}, null, {sort: '-date'}, function (err, allTopics) {
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

server.post('/topics', function (req, res) {
  var topic = new Topic({
    userid: req.session.currentUser,
    title: req.body.topic.title,
    description: req.body.topic.description,
    comments: [],
    numComments: 0,
    likes: 0
  });
  topic.save(function (err, newTopic) {
    if (err) {
        console.log("topic rejected");
        res.redirect(302, '/newtopic');
      } else {
        console.log("topic saved");
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
      res.write("something wrong w/ the ID...");
      res.end();
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
      res.write("something wrong w/ the ID...");
      res.end();
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
  var topicID = req.params.id;
  var currentComments = eval(req.params.commentlength) + 1;
  var newComment = '(Comment by: ' + res.locals.currentuser + ') "' + req.body.topic.newcomment + '"';
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
        console.log("This thing?", err);
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
            console.log("This thing?", err);
        } else {
          res.redirect(302, '/topics/' + topicID);
        }
      }
      );// res.redirect(302, '/topics/' + topicID);
    }
  }
  );
});




// Issues...?

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
        console.log("This thing?", err);
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

    } else {
      res.redirect(302, '/topics');
    }
  });
});

server.get('/topics/new', function (req, res) {
  res.render('newtopic' );
});

server.get('/users/:id', function (req, res) {
  console.log("can you see me?");
  console.log(req.params.id);
  var particularUser = req.params.id;
  Topic.find({
    userid: particularUser
  }, null, {sort: '-date'}, function (err, userTopics) {
    if (err) {

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

    } else {
      res.render('usertopics', {
        userid: particularUser,
        topics: userTopics
      });
    }
  });
});

server.get('/topics/:id/', function (req, res) {
  console.log(req.params.id);
  Topic.findById(req.params.id, function (err, particularTopic) {
    if (err) {
      console.log("darn...", err);
    } else {
      res.render('comments', {
        topic: particularTopic
      });
    }
  });
});

server.post('/topics/:id/newcomment', function (req, res) {
  var topicID = req.params.id;
  console.log("here, here...");
  Topic.findOne({
    _id: topicID
  }, function (err, foundTopic) {
    if (err) {
      res.write("something wrong w/ the ID...");
      res.end();
    } else {
       res.render('newcomment', {
          topic: foundTopic
       });
    }
  });
});



// catchall as a last resort (needed?)

server.use(function (req, res, next) {
  res.send("You are done...");
  res.end();
});

mongoose.connect(MONGOURI + "/" + dbname);
server.listen(PORT, function () {
  console.log("SERVER IS UP ON PORT: ", PORT);
});
