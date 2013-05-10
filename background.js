function onFacebookLogin(tabId, changeInfo, tab){
    var successURL = 'www.facebook.com/connect/login_success.html';
    console.log("facebook login", tabId, changeInfo)
    console.log("usrEmail", typeof(localStorage.getItem('usrEmail')), localStorage.getItem('usrEmail')==undefined);
    if (!localStorage.getItem('accessToken') || localStorage.getItem('usrEmail')=="undefined") {
      console.log("no access token");
      console.log("changeInfo.url", changeInfo.url);
      if (changeInfo.url && changeInfo.url.indexOf(successURL) !== -1) {
        console.log("matches successURL");
        // below you get string like this: access_token=...&expires_in=...
        var params = changeInfo.url.split('#')[1];

        // in my extension I have used mootools method: parseQueryString. The following code is just an example ;)
        var accessToken = params.split('&')[0];
        accessToken = accessToken.split('=')[1];
        console.log("access token", accessToken);

        // var i;
        // for (i=0; i < 5; i++) {
          
        // }

        localStorage.setItem('accessToken', accessToken);
        chrome.tabs.remove(tabId, function(){
          console.log("testing");
        });
      }
    }
  }

  chrome.tabs.onUpdated.addListener(onFacebookLogin);