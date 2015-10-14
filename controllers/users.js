var express = require('express'),
    router  = express.Router(),
    User    = require('../models/user.js');

// define routes for this router
router.get('/new', function (req, res) {
  res.render('users/new');
});


// export router object
module.exports = router;
