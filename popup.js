// Copyright (c) 2013 Mandy Korpusik and Hannah Sarver. All rights reserved.

var email;

var recipeOrganizer = {
  /**
  * Gets the window's current URL and POSTs it to localhost's printURL route.
  */
  callLocalHost: function(folderName) {
    chrome.tabs.query({active:true, currentWindow:true},function(tab){
      // console.log("tabs",tab);
      url = tab[0].url;
      title = tab[0].title;
      // img = "icon2.png";
      img = "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTkxN2BmcHpPHvSrCeruiURn9fT66lA17GldKluG_Jol9zMMj4q";
      console.log(tab[0]);
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {

          var page = $('<div>').html(xhr.responseText)[0];
          var img2 = undefined;

          if (url.match("allrecipes.com")){
            console.log("all recipes");
            img2 = $("#imgPhoto", page).attr("src");
            console.log(img2);
          }
          else if (url.match("epicurious.com")) {
            console.log("epicurious");
            img2 = "http://www.epicurious.com"+$(".photo", page).attr('src');
            console.log(img2);
          }
          
          if (img2 != undefined)
            img = img2;
        } //oauth2/lib/oauth2.js
      }
      xhr.send(null);

      var req = new XMLHttpRequest();
      req.open("POST", 'http://localhost:3000/printURL', true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      // var url = 'test'
      req.send('url='+url+'&folder='+folderName+'&title='+title+'&img='+img);
    });
  },

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
    var folderNames = new XMLHttpRequest();
    folderNames.open("GET", 'http://localhost:3000/folders/:'+usrEmail, false);
    folderNames.send(null);
    var folders = this.parseDOMString(folderNames.responseText);
    // var folders = ['Desserts', 'Appetizers', 'Dinner', 'Party'];
    for (var i = 0; i < folders.length; i++) {
      // add wrapper div
      var folder = document.createElement('div');
      folder.setAttribute('id', folders[i]);
      document.body.appendChild(folder);

      // add folder icon 
      // var img = document.createElement('img');
      // img.src = 'folder.png';
      // img.setAttribute('alt', folders[i]);
      var btn = document.createElement('BUTTON');
      btn.setAttribute('id', folders[i]);
      // btn.style.backgroundImage = "url('/folder.png')";
      // btn.style.backgroundColor = 'transparent';
      btn.style.backgroundImage = 'url("public/folder.png")';
      btn.style.backgroundRepeat = 'no-repeat';
      btn.style.backgroundSize = '35px 35px';
      btn.style.height = '40px';
      btn.style.width = '40px';
      btn.style.display = 'inline-block';
      btn.onclick = function() {
        recipeOrganizer.callLocalHost(this.id);
      };
      document.getElementById(folders[i]).appendChild(btn);

      // add label div
      var label = document.createElement('div');
      label.innerHTML = folders[i];
      label.style.display = 'inline-block';
      document.getElementById(folders[i]).appendChild(label);
    }
  },

  seeIfUser: function() {
    var userExists = new XMLHttpRequest();
    userExists.open("GET", 'http://localhost:3000/checkUser', false);
    userExists.send(null);
    console.log('user exists?:', userExists.responseText);
    if (userExists.responseText == 'false') {
      return false;
    } else {
      return true;
    };
  },


  // displayLogin: function() {
  //   var form = document.createElement('form');
  //   form.setAttribute('id', 'loginForm');
  //   var email = document.createElement('input');
  //   email.setAttribute('type', 'text');
  //   email.setAttribute('name', 'userEmail');
  //   var password = document.createElement('input');
  //   password.setAttribute('type', 'text');
  //   password.setAttribute('name', 'userPassword');
  //   var submitButton = document.createElement('input');
  //   submitButton.setAttribute('type', 'submit');
  //   submitButton.setAttribute('value', "Create Account");

  //   form.appendChild(email);
  //   form.appendChild(password);
  //   form.appendChild(submitButton);
  //   document.body.appendChild(form);

  //   jQuery('#loginForm').on('submit', function () {
  //     jQuery.post("http://localhost:3000/login", jQuery('#loginForm').serialize());
  //     return true;
  //   });
  // },

  displayNewFolder: function(usrEmail) {
    var form = document.createElement('form');
    form.setAttribute('id', 'addFolderForm');
    var folderIn = document.createElement('input');
    folderIn.setAttribute('type', 'text');
    folderIn.setAttribute('name', 'newFolderName');
    var emailHidden = document.createElement('input');
    emailHidden.setAttribute('type', 'hidden');
    emailHidden.setAttribute('name', 'userEmail');
    emailHidden.setAttribute('value', usrEmail);
    var submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('value', "New Folder");

    form.appendChild(folderIn);
    form.appendChild(emailHidden);
    form.appendChild(submitButton);
    document.body.appendChild(form);

    jQuery('#addFolderForm').on('submit', function () {
      jQuery.post("http://localhost:3000/addFolder", jQuery('#addFolderForm').serialize());
      return true;
    });
    
  },

  /**
  * Displays the button that, when clicked, navigates to recipes page.
  */
  displayButton: function(usrEmail) {
    var button = document.createElement('BUTTON');
    // button.setAttribute('class', 'btn');
    button.innerHTML = 'See Recipes';
    button.onclick = function() {
      chrome.tabs.create({ url: 'http://localhost:3000/recipes/:'+usrEmail });
    };
    document.body.appendChild(button);
  }
};

// Run our recipe organizer script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() { 
      if( xhr.readyState == 4 ) {
        if( xhr.status == 200 ) { 
          console.log("status 200");
          var parseResult = JSON.parse(xhr.responseText);
          // The email address is located naw: 
          usrEmail = parseResult["email"];
          console.log("email", usrEmail);
          recipeOrganizer.displayFolders(usrEmail);
          recipeOrganizer.displayNewFolder(usrEmail);
          recipeOrganizer.displayButton(usrEmail);
        } else {
          console.log("status not 200");
          usrEmail = "mandy.korpusik@students.olin.edu";
          console.log("error: use default email", usrEmail);
          recipeOrganizer.displayFolders(usrEmail);
          recipeOrganizer.displayNewFolder(usrEmail);
          recipeOrganizer.displayButton(usrEmail);
        }
      }
    }
    // Open it up as GET, POST didn't work for me for the userinfo 
    xhr.open("GET","https://www.googleapis.com/oauth2/v1/userinfo",true);
    // Set the content & autherization 
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', "OAuth " + googleAuth.getAccessToken() );
    xhr.send(null);
    
});

var googleAuth = new OAuth2('google', {
  client_id: '1049899099134.apps.googleusercontent.com',
  client_secret: 'Vu_dfcSLcK1e7cxfHWGsGRhP',
  api_scope: 'https://www.googleapis.com/auth/tasks', 
  api_scope: 'https://www.googleapis.com/auth/userinfo.email'
});

googleAuth.authorize(function() {
    //We should now have googleAuth.getAccessToken() returning a valid token value for us 
    //Create an XMLHttpRequest to get the email address 
    console.log("authorizing");
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() { 
      if( xhr.readyState == 4 ) {
        if( xhr.status == 200 ) { 
          var parseResult = JSON.parse(xhr.responseText);
          // The email address is located naw: 
          usrEmail = parseResult["email"];
          // console.log("email", usrEmail);
          // recipeOrganizer.displayFolders(usrEmail);
          // recipeOrganizer.displayNewFolder(usrEmail);
          // recipeOrganizer.displayButton(usrEmail);
        }
      }
    }
    // Open it up as GET, POST didn't work for me for the userinfo 
    xhr.open("GET","https://www.googleapis.com/oauth2/v1/userinfo",true);
    // Set the content & autherization 
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', "OAuth " + googleAuth.getAccessToken() );
    xhr.send(null);
    // Debugging stuff so we can see everything in the xhr.  Do not leave this in production code 
    console.log("xhr", xhr);
    console.log(googleAuth.getAccessToken());
  });