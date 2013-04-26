
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

exports.addFolder = function(req, res){
  var folderName = req.body.newFolderName;
  var folder = new Folder({ title: folderName});
  if (folderName.length > 0) {
    folder.save(function (err) {
      if (err)
        return console.log(err);
    });
  }
  // window.location.reload();
  // window.location.href = "popup.html";
  // chrome.browserAction.setPopup({popup: "popup.html"});
};

exports.recipes = function(req, res){
  // get all recipes from mongo and display on recipes page
  var folders =  Folder.find({}).populate('recipes').exec(function (err, docs) {
  	// console.log(docs);
  	res.render('recipes', { folders:docs, title: 'Recipes' });
  });
};

exports.folders = function(req, res){
  // get all folder names from mongo and display on popup
  var folders =  Folder.find({}).exec(function (err, docs) {
    var folderNames = [];
    for (var i in docs) {
      folderNames.push(docs[i].title);
    }
    res.send(folderNames);
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

    var currentFolder = Folder.findOne({title: folder}).exec(function (err, docs){
      if(err)
        console.log("Unable to find folder");
      var current_recipes = docs.recipes;
      current_recipes.push(recipe);
      docs.recipes = current_recipes;
      docs.save(function(err){
        if(err)
          console.log("Unable to add recipe to folder");
        }
      );
    });
  });
};