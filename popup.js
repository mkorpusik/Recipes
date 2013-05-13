// Copyright (c) 2013 Mandy Korpusik and Hannah Sarver. All rights reserved.

var email;

var recipeOrganizer = {
  /**
  * Gets the window's current URL and POSTs it to localhost's printURL route.
  */
  saveRecipe: function(folderID, btn) {
    // change button's background image
    var imgURL = 'url("public/folderBlueGrey.png")'
    btn.style.backgroundImage = imgURL;

    chrome.tabs.query({active:true, currentWindow:true},function(tab){
      url = tab[0].url;
      title = tab[0].title;
      // default image is fork and knife icon
      img = "http://www.bihardays.com/wp-content/uploads/2011/09/empty-plate.jpg";
      // img = "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTkxN2BmcHpPHvSrCeruiURn9fT66lA17GldKluG_Jol9zMMj4q";
      console.log(tab[0]);
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {

          var page = $('<div>').html(xhr.responseText)[0];
          var img2 = undefined;

          // scrape allrecipes for image and title
          if (url.match("allrecipes.com")){
            console.log("all recipes");
            img2 = $("#imgPhoto", page).attr("src");
            console.log(img2);
          }
          // scrape epicurious for image and title
          else if (url.match("epicurious.com")) {
            console.log("epicurious");
            img2 = "http://www.epicurious.com"+$(".photo", page).attr('src');
            console.log(img2);
          }
          // scrape epicurious for image and title
          else if (url.match("foodnetwork.com")) {
            console.log("foodnetwork");
            img2 = $("#recipe-image", page).attr('href');
            console.log(img2);
            if (img2 == undefined) {
              console.log("was undefined");
              img2 = $("#recipe-lead-wrap > :nth-child(2)", page).attr('src');
              console.log(img2);
            }
          }
          // scrape food.com for image and title
          else if (url.match("food.com")) {
            console.log("food");
            img2 = $(".smallPageImage", page).attr('src');
            title = $(".fn", page)[0].innerHTML;
            console.log("title", title);
            console.log(img2);
          }
          // scrape yummly.com for image and title
          else if (url.match("yummly.com")) {
            console.log("yummly");
            img2 = $(".image", page).children().first().attr('src');
            console.log(img2);
          }
          
          if (img2 != undefined)
            img = img2;
        } 
      }
      xhr.send(null);

      var req = new XMLHttpRequest();
      req.open("POST", 'http://myrecipebox.herokuapp.com/addRecipe', true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req.onreadystatechange = function() {
        console.log("status", req.status);
        if (req.status == 200) {
          // after 1 sec, change button's background image back to normal
          var myVar=setInterval(function(){
            btn.style.backgroundImage = 'url("public/folder.png")';
          },1000);
        }
      }
      req.send('url='+url+'&folder='+folderID+'&title='+title+'&img='+img);
      console.log("response", req.responseXML);
      // after 1 sec, change button's background image back to normal
      // var myVar=setInterval(function(){
      //   btn.style.backgroundImage = 'url("public/folder.png")';
      // },1000);
    });
  },

  /**
  * Parses the string list of folders and returns an actual list of folders.
  */
  parseDOMString: function(responseText) {
    var folderList = [];
    responseText = responseText.split('"');
    for (var i=0;i<responseText.length;i++){
      if ((i+2)%2!=0) {
        folderList.push(responseText[i]);
      }
    }
    console.log(folderList);
    return folderList;
  },

  /**
  * Displays list of folders in the extension's popup window.
  */
  displayFolders: function(usrEmail) {
    console.log('displaying folders');

    // get folder names from mongo db by GETting from local host
    var getFolders = new XMLHttpRequest();
    getFolders.open("GET", 'http://myrecipebox.herokuapp.com/folders/:'+usrEmail, false);
    getFolders.send(null);
    //var folders = this.parseDOMString(folderNames.responseText);
    console.log("response", getFolders.responseText);
    var folders = JSON.parse(getFolders.responseText);
    var folderNames = folders[0];
    var folderIds = folders[1];

    if (folderNames.length > 0) {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = "Click the + button next to any folder to add the current recipe page to it.";
      wrapper.style.padding = '0px 0px 15px 0px';
      document.body.appendChild(wrapper);
    } else {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = "Welcome to your Recipe Box! Get started by creating a folder.";
      wrapper.style.padding = '0px 0px 15px 0px';
      document.body.appendChild(wrapper);
    };

    for (var i = 0; i < folderNames.length; i++) {
      // add wrapper div
      var folder = document.createElement('div');
      folder.setAttribute('id', folderIds[i]);
      folder.style.padding = '0px 0px 5px 0px';
      document.body.appendChild(folder);

      // add folder icon 
      var btn = document.createElement('BUTTON');
      btn.setAttribute('id', folderIds[i]);
      btn.style.backgroundImage = 'url("public/folder.png")';
      btn.style.backgroundRepeat = 'no-repeat';
      btn.style.backgroundSize = '35px 35px';
      btn.style.height = '40px';
      btn.style.width = '40px';
      btn.style.display = 'inline-block';
      btn.style.padding = '0px 8px 0px 2px';
      btn.onclick = function() {
        recipeOrganizer.saveRecipe(this.id, this);
      };
      document.getElementById(folderIds[i]).appendChild(btn);

      // add label div
      // var label = document.createElement('div');
      // label.innerHTML = folders[i];
      // label.style.display = 'inline-block';
      // label.style.padding = '0px 0px 0px 8px';
      // document.getElementById(folders[i]).appendChild(label);

      var label = document.createElement('a');
      label.title = folderNames[i];
      label.style.display = 'inline-block';
      label.style.padding = '0px 0px 0px 8px';
      var linkText = document.createTextNode(folderNames[i]);
      label.appendChild(linkText);
      label.href = "http://myrecipebox.herokuapp.com/recipes/:"+usrEmail+"/:"+folderIds[i];
      label.target = "_blank";
      document.getElementById(folderIds[i]).appendChild(label);
    }
  },

  /**
  * Returns whether or not the user exists already in mongo.
  */
  seeIfUser: function() {
    var userExists = new XMLHttpRequest();
    userExists.open("GET", 'http://myrecipebox.herokuapp.com/checkUser', false);
    userExists.send(null);
    console.log('user exists?:', userExists.responseText);
    if (userExists.responseText == 'false') {
      return false;
    } else {
      return true;
    };
  },

  /**
  * Saves a new folder to mongo and displays it in the popup.
  */
  displayNewFolder: function(usrEmail) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = 'Add a new folder';
    wrapper.style.padding = '15px 0px 0px 0px';
    var form = document.createElement('form');
    form.setAttribute('id', 'addFolderForm');
    var folderIn = document.createElement('input');
    folderIn.setAttribute('type', 'text');
    folderIn.setAttribute('placeholder', 'Folder Title');
    folderIn.setAttribute('name', 'newFolderName');
    var emailHidden = document.createElement('input');
    emailHidden.setAttribute('type', 'hidden');
    emailHidden.setAttribute('name', 'userEmail');
    emailHidden.setAttribute('value', usrEmail);
    var submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('value', "New Folder");
    submitButton.style.margin = '0px 0px 0px 20px';

    form.appendChild(folderIn);
    form.appendChild(emailHidden);
    form.appendChild(submitButton);
    wrapper.appendChild(form);
    document.body.appendChild(wrapper);

    jQuery('#addFolderForm').on('submit', function () {
      console.log("button clicked");
      jQuery.post("http://myrecipebox.herokuapp.com/addFolder", jQuery('#addFolderForm').serialize(), function(data){
        console.log("successfully created folder")
        document.location.reload(true);
      });
      return false;
    });
    
  },

  /**
  * Displays the button that, when clicked, navigates to recipes page.
  */
  displayButton: function(usrEmail) {
    var button = document.createElement('BUTTON');
    button.innerHTML = 'See Recipes';
    button.onclick = function() {
      chrome.tabs.create({ url: 'http://myrecipebox.herokuapp.com/recipes/:'+usrEmail });
    };
    document.body.appendChild(button);
  },

    /**
  * Displays the button that, when clicked, logs the user out.
  */
  displayLogout: function(usrEmail) {
    var redbar = document.createElement('div');
    redbar.style.backgroundColor = '#E62914';
    redbar.style.color = 'white';
    redbar.style.padding = '10px 10px 10px 10px';
    redbar.style.margin = '0px 0px 10px 0px';
    var hello = document.createElement('div');
    hello.innerHTML = "Logged in as "+usrEmail;
    hello.style.display = 'inline-block';
    hello.style.margin = '10px 40px 0px 0px';
    var form = document.createElement('form');
    form.setAttribute('id', 'logoutForm');
    form.style.display = 'inline-block';
    var submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('value', "Logout");
    submitButton.style.display = 'inline-block';
    submitButton.style.float = 'right';
    hello.style.margin = '0px 20px 0px 0px';
    form.appendChild(hello);
    form.appendChild(submitButton);
    redbar.appendChild(form);
    document.body.appendChild(redbar);
    jQuery('#logoutForm').on('submit', function () {
      console.log("logging out");
      localStorage.removeItem('username');
      return true;
    });
  },

      /**
  * Displays the button that, when clicked, logs the user out.
  */
  displayLogin: function() {

    // display Facebook login title and link
    //add a div with text to say to try a new username
    var redbar = document.createElement('div');
    //wrapper.innerHTML = "Please type in a unique username to start saving and sharing recipes now!";
    redbar.innerHTML = "Log in with your existing credentials or click 'Create Account'";
    redbar.style.backgroundColor = '#E62914';
    redbar.style.color = 'white';
    redbar.style.padding = '10px 10px 10px 10px';
    redbar.style.margin = '0px 0px 10px 0px';

    var loginForm = document.createElement('form');
    loginForm.setAttribute('id', 'loginForm');
    var newUser = document.createElement('input');
    newUser.setAttribute('type', 'text');
    newUser.setAttribute('placeholder', 'Username');
    newUser.setAttribute('name', 'newUserName');
    newUser.style.margin = '0px 0px 10px 0px';
    var newPass = document.createElement('input');
    newPass.setAttribute('type', 'password');
    newPass.setAttribute('placeholder', 'Password');
    newPass.setAttribute('name', 'newPassword');
    newPass.style.margin = '0px 0px 10px 0px';
    var submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('value', "Submit");
    submitButton.setAttribute('id', 'submitButton');
    submitButton.style.display = 'block';

    var newUserButton = document.createElement('BUTTON');
    newUserButton.innerHTML = "Create Account";
    newUserButton.setAttribute('id', 'createButton');
    newUserButton.style.margin = '20px 0px 0px 0px';
    newUserButton.onclick = function(){
      recipeOrganizer.displaySingup();

    };

    
    loginForm.appendChild(newUser);
    loginForm.appendChild(newPass);
    loginForm.appendChild(submitButton);
    // loginForm.appendChild(newUserButton);
    
    document.body.appendChild(redbar);
    document.body.appendChild(loginForm);
    document.body.appendChild(newUserButton);

    jQuery('#loginForm').on('submit', function () {
      var newname = jQuery('#loginForm').serialize().split('=')[1].split('&')[0];
      console.log('username login', newname);
      jQuery.post("http://myrecipebox.herokuapp.com/loginUser", jQuery('#loginForm').serialize(), function(data){
        console.log("data", data);
        console.log(typeof(data));
        if (data == 'true') {
          localStorage.setItem('username', newname);
        } else {
          window.alert("Incorrect username or password");
        }
        document.location.reload(true);
        //return true;
      });
      return false;
    });

  },

      /**
  * Displays the button that, when clicked, logs the user out.
  */
  displaySingup: function() {

    var newElement = document.createElement('body');
    document.body = newElement;

    var redbar = document.createElement('div');
    redbar.innerHTML = "Please type in a unique username and any password to start saving and sharing recipes now!";
    redbar.style.backgroundColor = '#E62914';
    redbar.style.color = 'white';
    redbar.style.padding = '10px 10px 10px 10px';
    redbar.style.margin = '0px 0px 10px 0px';

    var loginForm = document.createElement('form');
    loginForm.setAttribute('id', 'newUserForm');
    var newUser = document.createElement('input');
    newUser.setAttribute('type', 'text');
    newUser.setAttribute('placeholder', 'Username');
    newUser.setAttribute('name', 'newUserName');
    newUser.style.margin = '0px 0px 10px 0px';
    var newPass = document.createElement('input');
    newPass.setAttribute('type', 'password');
    newPass.setAttribute('placeholder', 'Password');
    newPass.setAttribute('name', 'newPassword');
    newPass.style.margin = '0px 0px 10px 0px';
    var confirmPass = document.createElement('input');
    confirmPass.setAttribute('type', 'password');
    confirmPass.setAttribute('placeholder', 'Confirm Password');
    confirmPass.setAttribute('name', 'confirmPassword');
    confirmPass.style.margin = '0px 0px 10px 0px';
    var submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('value', "Submit");
    submitButton.setAttribute('id', 'submitButton');
    submitButton.style.display = 'block';

    loginForm.appendChild(newUser);
    loginForm.appendChild(newPass);
    loginForm.appendChild(confirmPass);
    loginForm.appendChild(submitButton);
    document.body.appendChild(redbar);
    document.body.appendChild(loginForm);
    

    jQuery('#newUserForm').on('submit', function () {
      var newname = jQuery('#newUserForm').serialize().split('=')[1].split('&')[0];
      
      console.log('new username', newname);
      jQuery.post("http://myrecipebox.herokuapp.com/addUser", jQuery('#newUserForm').serialize(), function(data){
        console.log("bananas");
        console.log("data new user", data);
        console.log(typeof(data));
        if (data == 'true') {
          localStorage.setItem('username', newname);
        } else {
          window.alert("Passwords do not match");
        }
        document.location.reload(true);
      });
      return false;
    });
  }

};

// var adapterURL = chrome.extension.getURL("adapter.html");
// console.log(adapterURL, "testing");


/**
  * Run our recipe organizer script as soon as the document's DOM is ready.
  */

document.addEventListener('DOMContentLoaded', function () {
  console.log("add event listener")

  if (!localStorage.getItem('username')) {

    recipeOrganizer.displayLogin();
    
  }
  else {
    // get user email from Facebook access token
      var username = localStorage.getItem('username');
      console.log("username", username);

        recipeOrganizer.displayLogout(username);
        recipeOrganizer.displayFolders(username);
        recipeOrganizer.displayNewFolder(username);

          }


// document.addEventListener('DOMContentLoaded', function () {
//   console.log("add event listener")
//   var successURL = 'www.facebook.com/connect/login_success.html';
//   var usrEmail = undefined;
//   localStorage.setItem('usrEmail', "undefined");

//   if (!localStorage.getItem('accessToken')) {
//     // display Facebook login title and link
//     var header = document.createElement('div');
//     header.innerHTML = "Log Into Facebook to Start Saving and Sharing Recipes!";
//     document.body.appendChild(header);
//     var a = document.createElement('a');
//     a.title = "Facebook Connect";
//     var linkText = document.createTextNode("Facebook Connect");
//     a.appendChild(linkText);
//     a.href = "https://www.facebook.com/dialog/oauth?client_id=421108067985880&response_type=token&scope=email&redirect_uri=http://www.facebook.com/connect/login_success.html";
//     a.target = "_blank";
//     document.body.appendChild(a);
//   }
//   else {
//     // get user email from Facebook access token
//     var xhr = new XMLHttpRequest();
//     var graphURL = "https://graph.facebook.com/me?access_token="+localStorage.getItem('accessToken');
//     xhr.open("GET", graphURL, false);
//     xhr.onreadystatechange = function() {
//         if (xhr.readyState == 4) {
//           var usrEmail = JSON.parse(xhr.responseText).email;
//           localStorage.setItem('usrEmail', usrEmail);
//           console.log("email", usrEmail);

//           if (usrEmail != undefined) {
//             // display folders and forms
//             recipeOrganizer.displayFolders(usrEmail);
//             recipeOrganizer.displayNewFolder(usrEmail);
//             recipeOrganizer.displayButton(usrEmail);
//           } else {
//             // display Facebook login title and link
//             var header = document.createElement('div');
//             header.innerHTML = "Facebook Connect For Chrome Extension";
//             document.body.appendChild(header);
//             var a = document.createElement('a');
//             a.title = "Facebook Connect";
//             var linkText = document.createTextNode("Facebook Connect");
//             a.appendChild(linkText);
//             a.href = "https://www.facebook.com/dialog/oauth?client_id=421108067985880&response_type=token&scope=email&redirect_uri=http://www.facebook.com/connect/login_success.html";
//             a.target = "_blank";
//             document.body.appendChild(a);
//           }
//         }
//     }
//     xhr.send(null);

//   }

  // function onFacebookLogin(tabId, changeInfo, tab){
  //   console.log("facebook login", tabId, changeInfo)
  //   console.log("usrEmail", typeof(localStorage.getItem('usrEmail')), localStorage.getItem('usrEmail')==undefined);
  //   if (!localStorage.getItem('accessToken') || localStorage.getItem('usrEmail')=="undefined") {
  //     console.log("no access token");
  //     console.log(changeInfo.url, changeInfo.url);
  //     if (changeInfo.url && changeInfo.url.indexOf(successURL) !== -1) {
  //       console.log("matches successURL");
  //       // below you get string like this: access_token=...&expires_in=...
  //       var params = changeInfo.url.split('#')[1];

  //       // in my extension I have used mootools method: parseQueryString. The following code is just an example ;)
  //       var accessToken = params.split('&')[0];
  //       accessToken = accessToken.split('=')[1];
  //       console.log("access token", accessToken);

  //       // var i;
  //       // for (i=0; i < 5; i++) {
          
  //       // }

  //       localStorage.setItem('accessToken', accessToken);
  //       chrome.tabs.remove(tabId, function(){
  //         console.log("testing");
  //       });
  //     }
  //   }
  // }

  // chrome.tabs.onUpdated.addListener(onFacebookLogin);

});