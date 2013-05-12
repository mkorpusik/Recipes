
/**
 * Module dependencies.
 */

var express = require('express')
  , bcrypt = require('bcrypt')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/recipes/:email', routes.recipes);
app.get('/recipes/:email/:folderID', routes.recipesFolder);
app.get('/folders/:email', routes.folders);
app.get('/checkUser', routes.checkUser);
app.post('/addRecipe', routes.addRecipe);
app.post('/addFolder', routes.addFolder);
app.post('/deleteFolder', routes.deleteFolder);
app.post('/shareFolder', routes.shareFolder);
app.post('/removeRecipe', routes.removeRecipe);
app.post('/addNote', routes.addNote)

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
