
/*
 * GET and POST requests.
 */

var models = require('../models');
var Recipe = models.Recipe;
var Folder = models.Folder;
var User = models.User;

var bcrypt = require('bcrypt');

exports.index = function(req, res){
  res.render('index2', { folders: [], email: "", title: 'Recipes'});
};

/**
  * Checks whether the user is undefined, and returns a string of true or false.
  */
exports.checkUser = function(req, res){
  console.log('existing user: ', req.session.user);
  if (req.session.user==undefined) {
    res.send('false');
  } else {
    res.send('true')};
};

/**
  * Remove the given recipe from mongo.
  */
exports.removeRecipe = function(req, res) {
  console.log(req.body);
  var folderID = req.body.folder;
  Recipe.remove({'_id': req.body.recipe}).exec(
    function (err, docs) {
      if (err) console.log(err);
      res.redirect('/recipes/:'+req.body.userEmail+'/:'+folderID);
  });
}

/**
  * Remove the given folder from mongo.
  */
exports.deleteFolder = function(req, res) {
  console.log(req.body);
  var folderID = req.body.folder;
  Folder.findOne({'_id': folderID}).exec(
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

/**
  * Add a friend's email to the owners field of the given folder.
  */
exports.shareFolder = function(req, res) {
    var folderID = req.body.folder;
    var currentFolder = Folder.findOne({'_id': folderID}).exec(function (err, docs){
      if(err)
        console.log("Unable to find folder");
      var current_owners = docs.owners;
      current_owners.push(req.body.sharer);
      docs.owners = current_owners;
      docs.save(function(err){
        if(err)
          console.log("Unable to add friend to folder");
        res.redirect('/recipes/:'+req.body.email+'/:'+folderID);
        }
      );
    });
}

/**
  * Add a note to the given folder.
  */
exports.addNote = function(req, res) {
    var folderID = req.body.folder;
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
        res.redirect('/recipes/:'+req.body.userEmail+'/:'+folderID);
        }
      );
    });
}

/**
  * Add a new folder to mongo.
  */
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
};

/**
  * Add a new user to mongo.
  */
exports.addUser = function(req, res){
  var username = req.body.newUserName;
  var password = req.body.newPassword;
  var confirmPass = req.body.confirmPassword;
  if (password == confirmPass) {
    var passwordHashed = bcrypt.hashSync(password, 10);
    console.log("hashed password", passwordHashed);
    var newUser = new User({ username: username, password : passwordHashed});
    if (username.length > 0) {
      newUser.save(function (err) {
        if (err){
          console.log(err);
        } else {
          res.send('true');
        }
      });
    }
  } else {
    res.send('false');
  }
};

/**
  * Check a user's password from mongo.
  */
exports.loginUser = function(req, res){
  var username = req.body.newUserName;
  var password = req.body.newPassword;

  var findUser = User.findOne({'username':username}).exec(function(foundUser, error) {
    if (error  || foundUser == null) {
      console.log("error or null");
      res.send('false');
    } else {
      var retrievedPass = foundUser.password;
      var success  = bcrypt.compareSync(password, retrievedPass);
      if (success) {
        res.send('true');
      } else {
        res.send('false');
      }
    }
  });

};

/**
  * Render recipes page with first folder found in mongo, or if no folders exist, renders index page.
  */
exports.recipes = function(req, res){
  // get all recipes from mongo and display on recipes page
  var email = req.params.email.slice(1);
  console.log("email in recipes route", email);
  var folders =  Folder.find({owners: email}).sort('title').populate('recipes').exec(function (err, docs) {
    if (docs.length > 0) {
      var folder = docs[0];
      res.render('recipes', { folders:docs, email:email, folder:folder, title: 'Recipes' });
    }
    else {
      res.render('index', {email:email, title:'Recipes'});
    }
  });
};

/**
  * Render recipes page with associated folder.
  */
exports.recipesFolder = function(req, res){
  // get all recipes from mongo and display on recipes page
  var email = req.params.email.slice(1);
  var folderID = req.params.folderID.slice(1);
  console.log("folder ID", folderID);
  console.log("email in recipes route", email);
  var folders =  Folder.find({owners: email}).sort('title').populate('recipes').exec(function (err, docs) {
    var currentFolder = Folder.findOne({'_id': folderID}).populate('recipes').exec(function (err, docs2){
      if(err)
        console.log("Unable to find folder");
      res.render('recipes', { folders:docs, email:email, folder:docs2, title: 'Recipes' });
    });
  });
};

exports.folders = function(req, res){
  // get all folder names from mongo and display on popup
  var email = req.params.email.slice(1);
  var folders =  Folder.find({owners: email}).sort('title').exec(function (err, docs) {
    var folderNames = [];
    var folderIds = [];
    for (var i in docs) {
      folderNames.push(docs[i].title);
      folderIds.push(docs[i]._id);
    }
    res.send([folderNames, folderIds]);
  });
};

/**
  * Add a new recipe to mongo.
  */
exports.addRecipe = function(req, res){
  // create new recipe using URL of current window and save to mongodb
  var url = req.body.url;
  var folder = req.body.folder;
  var title = req.body.title;
  var img = req.body.img;
  console.log('url', url);
  console.log('folder', folder);

  // add to mongoose db
  var recipe = new Recipe({ url: url, title:title, img:img, notes:[]});
  recipe.save(function (err) {
    if (err)
      return console.log(err);

    var currentFolder = Folder.findOne({title: folder}).populate('recipes').exec(function (err, docs){
      if(err)
        console.log("Unable to find folder");
      var current_recipes = docs.recipes;
      current_recipes.push(recipe);
      // sort recipes alphabetically
      // console.log('unsorted recipes', current_recipes);
      // current_recipes.sort();
      // console.log('sorted recipes', current_recipes);
      docs.recipes = current_recipes;
      docs.save(function(err){
        if(err)
          console.log("Unable to add recipe to folder");
        }
      );
    });
  });
};