
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

exports.checkUser = function(req, res){
  console.log('existing user: ', req.session.user);
  if (req.session.user==undefined) {
    res.send('false');
  } else {
    res.send('true')};
};

exports.login = function(req, res){
  console.log('body: ', req.body);
  var newUser = new User({'email':req.body.userEmail, 'password':req.body.userPassword});
  if (req.body.userEmail.length > 0) {
    newUser.save(function (err) {
      if (err)
        return console.log(err);
    });
  }
  req.session.user = newUser;
  console.log('user ', req.session.user);
  //var hashedPassword = bcrypt.hashSync('SuperSecretPassword', 10);
};

exports.deleteFolder = function(req, res) {
  Folder.remove({'_id': req.body.folder}).exec(
    function (err) {
      if (err) return handleError(err);
      // remember to send the response!
      res.send('check');
  });
}

exports.shareFolder = function(req, res) {
    var currentFolder = Folder.findOne({'_id': req.body.folder}).exec(function (err, docs){
      if(err)
        console.log("Unable to find folder");
      var current_owners = docs.owners;
      current_owners.push(req.body.sharer);
      docs.owners = current_owners;
      docs.save(function(err){
        if(err)
          console.log("Unable to add friend to folder");
        res.redirect('/recipes');
        }
      );
    });
}

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
  var folders =  Folder.find({}).sort('title').populate('recipes').exec(function (err, docs) {
  	// console.log(docs);
  	res.render('recipes', { folders:docs, title: 'Recipes' });
  });
};

exports.folders = function(req, res){
  // get all folder names from mongo and display on popup
  var folders =  Folder.find({}).sort('title').exec(function (err, docs) {
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
  var title = req.body.title;
  var img = req.body.img;
  console.log('url', url);
  console.log('folder', folder);
  // results = jQuery('#imgPhoto');
  // img = results.src;
  // console.log("results", img);

  // add to mongoose db
  var recipe = new Recipe({ url: url, title:title, img:img});
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