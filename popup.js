// Copyright (c) 2013 Mandy Korpusik and Hannah Sarver. All rights reserved.

var QUERY = 'puppies';

var recipeOrganizer = {
  /**
  * Gets the window's current URL and POSTs it to localhost's printURL route.
  */
  callLocalHost: function() {
    chrome.tabs.query({active:true, currentWindow:true},function(tab){
      // console.log("tabs",tab);
      url = tab[0].url;
      var req = new XMLHttpRequest();
      req.open("POST", 'http://localhost:3000/printURL', true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      // var url = 'test'
      req.send('url='+url);
    });
  },

  /**
  * Displays list of folders in the extension's popup window.
  */
  displayFolders: function() {
    var folders = ['Desserts', 'Appetizers', 'Dinner', 'Party'];
    for (var i = 0; i < folders.length; i++) {
      // add wrapper div
      var folder = document.createElement('div');
      folder.setAttribute('id', folders[i]);
      document.body.appendChild(folder);

      // add folder icon 
      var img = document.createElement('img');
      img.src = 'folder.png';
      img.setAttribute('alt', folders[i]);
      img.style.height = '40px';
      img.style.width = '40px';
      img.style.display = 'inline-block';
      document.getElementById(folders[i]).appendChild(img);

      // add label div
      var label = document.createElement('div');
      label.innerHTML = folders[i];
      label.style.display = 'inline-block';
      document.getElementById(folders[i]).appendChild(label);

    }
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
  },

  /**
   * Flickr URL that will give us lots and lots of whatever we're looking for.
   *
   * See http://www.flickr.com/services/api/flickr.photos.search.html for
   * details about the construction of this URL.
   *
   * @type {string}
   * @private
   */
  searchOnFlickr_: 'https://secure.flickr.com/services/rest/?' +
      'method=flickr.photos.search&' +
      'api_key=90485e931f687a9b9c2a66bf58a3861a&' +
      'text=' + encodeURIComponent(QUERY) + '&' +
      'safe_search=1&' +
      'content_type=1&' +
      'sort=interestingness-desc&' +
      'per_page=20',

  /**
   * Sends an XHR GET request to grab photos of lots and lots of kittens. The
   * XHR's 'onload' event is hooks up to the 'showPhotos_' method.
   *
   * @public
   */
  requestKittens: function() {
    var req = new XMLHttpRequest();
    req.open("GET", this.searchOnFlickr_, true);
    req.onload = this.showPhotos_.bind(this);
    req.send(null);
  },

  /**
   * Handle the 'onload' event of our kitten XHR request, generated in
   * 'requestKittens', by generating 'img' elements, and stuffing them into
   * the document for display.
   *
   * @param {ProgressEvent} e The XHR ProgressEvent.
   * @private
   */
  showPhotos_: function (e) {
    var kittens = e.target.responseXML.querySelectorAll('photo');
    for (var i = 0; i < kittens.length; i++) {
      var img = document.createElement('img');
      img.src = this.constructKittenURL_(kittens[i]);
      img.setAttribute('alt', kittens[i].getAttribute('title'));
      document.body.appendChild(img);
    }
  },

  /**
   * Given a photo, construct a URL using the method outlined at
   * http://www.flickr.com/services/api/misc.urlKittenl
   *
   * @param {DOMElement} A kitten.
   * @return {string} The kitten's URL.
   * @private
   */
  constructKittenURL_: function (photo) {
    return "http://farm" + photo.getAttribute("farm") +
        ".static.flickr.com/" + photo.getAttribute("server") +
        "/" + photo.getAttribute("id") +
        "_" + photo.getAttribute("secret") +
        "_s.jpg";
  }
};

// Run our recipe organizer script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  recipeOrganizer.callLocalHost();
  recipeOrganizer.displayFolders();
  recipeOrganizer.displayButton();
});
