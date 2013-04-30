$(document).ready(function (){

  //use click and event targets for buttons
  $('.deleteFolder').click(function (event) {
     //remember to check your browser console!
  	 console.log('deleting folder');
  	 var target = event.target;
  	 console.log(target.value);
     $.post("/deleteFolder", {"folder":target.value}, 
        // remember send a response!
        function(response) {
          console.log(response);
          $('#'+target.value).remove();
        });
     
    return false;
  });

  // //use click and event targets for buttons
  // $('.shareFolder').click(function (event) {
  //    //remember to check your browser console!
  //    console.log('sharing folder');
  //    var target = event.target;
  //    console.log(target.value);
  //    $.post("/shareFolder", {"folder":target.value}, 
  //       // remember send a response!
  //       function(response) {
  //         console.log(response);
  //         // TODO: just add text of who folder is now shared with (instead of reloading)
  //       });
     
  //   return true;
  // });

  
  
});