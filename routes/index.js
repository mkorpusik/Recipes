
/*
 * GET home page.
 */


var models = require('../models');
var Recipe = models.Recipe;
var Folder = models.Folder;
var User = models.User;

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.printURL = function(req, res){
  // res.render('index', { title: 'Express' });
  var url = req.body.url;
  console.log('url', url);
  var recipe = new Recipe({ url: url});
  recipe.save(function (err) {
  	if (err)
    	return console.log(err);
  });
};