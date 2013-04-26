// Copyright (c) 2013 Mandy Korpusik and Hannah Sarver. All rights reserved.


var recipeOrganizer = {
  /**
  * Gets the window's current URL and POSTs it to localhost's printURL route.
  */
  callLocalHost: function(folderName) {
    chrome.tabs.query({active:true, currentWindow:true},function(tab){
      // console.log("tabs",tab);
      url = tab[0].url;
      title = tab[0].title;
      img = "";
      console.log(tab[0]);
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          var page = $('<div>').html(xhr.responseText)[0];
          console.log($("#imgPhoto", page).attr("src"));
          img = $("#imgPhoto", page).attr("src");
        }
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
  displayFolders: function() {
    // get folder names from mongo db by GETting from local host
    var folderNames = new XMLHttpRequest();
    folderNames.open("GET", 'http://localhost:3000/folders', false);
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

  displayNewFolder: function() {
    var form = document.createElement('form');
    form.setAttribute('id', 'addFolderForm');
    var folderIn = document.createElement('input');
    folderIn.setAttribute('type', 'text');
    folderIn.setAttribute('name', 'newFolderName');
    var submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('value', "New Folder");

    form.appendChild(folderIn);
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
  displayButton: function() {
    var button = document.createElement('BUTTON');
    button.innerHTML = 'See Recipes';
    button.onclick = function() {
      chrome.tabs.create({ url: 'http://localhost:3000/recipes' });
    };
    document.body.appendChild(button);
  }
};

// Run our recipe organizer script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  // recipeOrganizer.callLocalHost();
  recipeOrganizer.displayFolders();
  recipeOrganizer.displayNewFolder();
  recipeOrganizer.displayButton();
});
