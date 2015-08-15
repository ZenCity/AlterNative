Accounts.ui.config({
  requestPermissions: {
    facebook: ['public_profile','user_likes'],
  },
  //passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
  passwordSignupFields: 'USERNAME_ONLY'
});

Template.login.events({
  'click #userDetails': function(e) {
    console.log(Meteor.user());
  }
});

Template.login.helpers({
  displaySearch: function () {
    console.log("going to search");
    Router.go('/search');
  }
});
/*
Template.login.events({

    'submit #login-form' : function(e, t){
      e.preventDefault();
      // retrieve the input field values
      var email = t.find('#login-email').value
        , password = t.find('#login-password').value;

        // Trim and validate your fields here.... 

        // If validation passes, supply the appropriate fields to the
        // Meteor.loginWithPassword() function.
        Meteor.loginWithPassword(email, password, function(err){
        if (err)
        {
          console.log("LOGIN ERROR!!!")
        }
          // The user might not have been found, or their passwword
          // could be incorrect. Inform the user that their
          // login attempt has failed. 
        else 
        {

        }
          // The user has been logged in.
      });
      
      return false; 
      
      }
});
*/

