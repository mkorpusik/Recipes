var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/myrecipes');

var recipeSchema = mongoose.Schema({
  url: String
});

var Recipe = mongoose.model('Recipe', recipeSchema);

var folderSchema = mongoose.Schema({
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  title: String
});

var Folder = mongoose.model('Folder', folderSchema);

var userSchema = mongoose.Schema({
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],
  name: String
});

var User = mongoose.model('User', userSchema);

module.exports.Recipe = Recipe;
module.exports.Folder = Folder;
module.exports.User = User;
