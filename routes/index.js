
/*
 * GET home page.
 */

var models = require('../models');
var Recipe = models.Recipe;
var Folder = models.Folder;
var User = models.User;

exports.index = function(req, res){
  res.render('recipes', { folders: [], email: "", title: 'Recipes'});
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

exports.removeRecipe = function(req, res) {
  console.log(req.body);
  Recipe.remove({'_id': req.body.recipe}).exec(
    function (err, docs) {
      if (err) console.log(err);
      res.redirect('/recipes/:'+req.body.userEmail);
  });
}

exports.deleteFolder = function(req, res) {
  console.log(req.body);
  Folder.findOne({'_id': req.body.folder}).exec(
    function (err, docs) {
      if (err) console.log(err);
      var current_owners = docs.owners;
      var owner_index = current_owners.indexOf(req.body.userEmail);
      current_owners.splice(owner_index, 1);
      docs.owners = current_owners;
      docs.save(function(err){
        if(err)
          console.log("Unable to remove your email from folder");
      // remember to send the response!
      res.redirect('/recipes/:'+req.body.userEmail);
  });
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
        res.redirect('/recipes/:'+req.body.email);
        }
      );
    });
}

exports.addNote = function(req, res) {
    var currentRecipe = Recipe.findOne({'_id': req.body.recipe}).exec(function (err, docs){
      if(err)
        console.log("Unable to find recipe");
      var current_notes = docs.notes;
      current_notes.push(req.body.note);
      console.log('current notes', current_notes);
      docs.notes = current_notes;
      docs.save(function(err){
        if(err)
          console.log("Unable to add note to recipe");
        res.redirect('/recipes/:'+req.body.userEmail);
        }
      );
    });
}

exports.addFolder = function(req, res){
  var folderName = req.body.newFolderName;
  var userEmail = req.body.userEmail;
  var folder = new Folder({ title: folderName, owners : [userEmail]});
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
  var email = req.params.email.slice(1);
  console.log("email in recipes route", email);
  var folders =  Folder.find({owners: email}).sort('title').populate('recipes').exec(function (err, docs) {
  	// console.log(docs);
  	res.render('recipes', { folders:docs, email:email, title: 'Recipes' });
  });
};

exports.folders = function(req, res){
  // get all folder names from mongo and display on popup
  var email = req.params.email.slice(1);
  var folders =  Folder.find({owners: email}).sort('title').exec(function (err, docs) {
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
  var recipe = new Recipe({ url: url, title:title, img:img, notes:[]});
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