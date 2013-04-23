
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

exports.recipes = function(req, res){
  // get all recipes from mongo and display on recipes page
  var recipes =  Recipe.find({}).exec(function (err, docs) {
  	// console.log(docs);
  	res.render('recipes', { recipes:docs, title: 'Recipes' });
  });
};

exports.printURL = function(req, res){
  // create new recipe using URL of current window and save to mongodb
  var url = req.body.url;
  var folder = req.body.folder;
  console.log('url', url);
  console.log('folder', folder);

  var recipe = new Recipe({ url: url});
  recipe.save(function (err) {
  	if (err)
    	return console.log(err);
  });

};