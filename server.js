var express           = require('express'),
    // PORT              = process.env.PORT || 3000,
    PORT              = 3000,
    server            = express(),
    // MONGOURI          = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    MONGOURI          = "mongodb://localhost:27017",
    dbname            = "projecttwo",
    mongoose          = require('mongoose'),
    ejs               = require('ejs'),
    morgan            = require('morgan'),
    methodOverride    = require('method-override'),
    bodyParser        = require('body-parser'),
    expressEjsLayouts = require('express-ejs-layouts'),
    session           = require('express-session');

var Topic            = mongoose.model("topic", {
  userid: String,
  // name: String,
  title: String,
  description: { type: String, maxlength: 500 }
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

server.get('/super-secret-test', function (req, res) {
  res.write("Welcome to my amazing app");
  res.end();
});

server.get('/', function (req, res) {
  res.locals.userid = undefined;
  res.render('login');
});

server.get('/login', function (req, res) {
  res.render('login');
})

server.post('/logout', function (req, res) {
  req.session.userId = undefined;
  res.redirect(302, '/');
})

server.post('/login', function (req, res) {
  req.session.userId = req.body.userId;
  res.redirect(302, '/topics')
});

server.use(function (req, res, next) {
  if (req.session.userId == undefined) {
    res.redirect(302, '/');
  } else {
    res.locals.userid = req.session.userId;
    next();
  }
});

server.get('/topics', function (req, res) {
  Topic.find({}, function (err, allTopics) {
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
    userid: req.session.userId,
    title: req.body.topic.title,
    description: req.body.topic.description
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
  var userid = req.session.userId;

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

server.get('/users/:userid', function (req, res) {
  var particularUser = req.params.userid;
  Topic.find({
    userid: particularUser
  }, function (err, userTopics) {
    if (err) {

    } else {
      res.render('usertopics', {
        userid: particularUser,
        topics: userTopics
      });
    }
  });
});

mongoose.connect(MONGOURI + "/" + dbname);
server.listen(PORT, function () {
  console.log("SERVER IS UP ON PORT: ", PORT);
});
