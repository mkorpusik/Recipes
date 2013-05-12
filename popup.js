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
      // req.onreadystatechange = function() {
      //   console.log("status", req.status);
      //   if (req.status == 200) {
      //     // after 1 sec, change button's background image back to normal
      //     var myVar=setInterval(function(){
      //       btn.style.backgroundImage = 'url("public/folder.png")';
      //     },1000);
      //   }
      // }
      req.send('url='+url+'&folder='+folderID+'&title='+title+'&img='+img);
      // console.log("response", req.responseXML);
      // after 1 sec, change button's background image back to normal
      var myVar=setInterval(function(){
        btn.style.backgroundImage = 'url("public/folder.png")';
      },1000);
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
    var folderNames = new XMLHttpRequest();
    folderNames.open("GET", 'http://myrecipebox.herokuapp.com/folders/:'+usrEmail, false);
    folderNames.send(null);
    var folders = this.parseDOMString(folderNames.responseText);
    for (var i = 0; i < folders.length; i++) {
      // add wrapper div
      var folder = document.createElement('div');
      folder.setAttribute('id', folders[i]);
      document.body.appendChild(folder);

      // add folder icon 
      var btn = document.createElement('BUTTON');
      btn.setAttribute('id', folders[i]);
      btn.style.backgroundImage = 'url("public/folder.png")';
      btn.style.backgroundRepeat = 'no-repeat';
      btn.style.backgroundSize = '35px 35px';
      btn.style.height = '40px';
      btn.style.width = '40px';
      btn.style.display = 'inline-block';
      btn.onclick = function() {
        recipeOrganizer.saveRecipe(this.id, this);
      };
      document.getElementById(folders[i]).appendChild(btn);

      // add label div
      var label = document.createElement('div');
      label.innerHTML = folders[i];
      label.style.display = 'inline-block';
      document.getElementById(folders[i]).appendChild(label);
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

    form.appendChild(folderIn);
    form.appendChild(emailHidden);
    form.appendChild(submitButton);
    wrapper.appendChild(form);
    document.body.appendChild(wrapper);

    jQuery('#addFolderForm').on('submit', function () {
      jQuery.post("http://myrecipebox.herokuapp.com/addFolder", jQuery('#addFolderForm').serialize(), function(data){
        console.log("successfully created folder")
        return true;
      });
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
    // display Facebook login title and link
    //add a div with text to say to try a new username
    var wrapper = document.createElement('div');
    wrapper.innerHTML = "Please type in a unique username to start saving and sharing recipes now!";
    var loginForm = document.createElement('form');
    loginForm.setAttribute('id', 'newUserForm');
    var newUser = document.createElement('input');
    newUser.setAttribute('type', 'text');
    newUser.setAttribute('placeholder', 'Username');
    newUser.setAttribute('name', 'newUserName');
    var submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('value', "Submit");

    
    loginForm.appendChild(newUser);
    loginForm.appendChild(submitButton);
    wrapper.appendChild(loginForm);
    document.body.appendChild(wrapper);

    jQuery('#newUserForm').on('submit', function () {
      localStorage.setItem('username',jQuery('#newUserForm').serialize().split('=')[1]);
        return true;
      });
  }
  else {
    // get user email from Facebook access token
      var username = localStorage.getItem('username');
      console.log("username", username);

        recipeOrganizer.displayFolders(username);
        recipeOrganizer.displayNewFolder(username);
        recipeOrganizer.displayButton(username);
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