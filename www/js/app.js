var AulettaGlobal = AulettaGlobal || {};

AulettaGlobal.helpers = 
{
		isNotString: function(str) 
		{
			return (typeof str !== "string");
		}, 		
		getPhoneGapPath: function() 
		{
			var pgPath = "";
			var path = window.location.pathname;
			return path.substr( path, path.length - 10 );
		},
		generateGUID: function() 
		{
		    function _p8(s) {
		        var p = (Math.random().toString(16)+"000000000").substr(2,8);
		        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
		    }
		    return _p8() + _p8(true) + _p8(true) + _p8();
		},
		isLoggedIn: function()
		{
			var currentUser = Parse.User.current();
			if(currentUser)
			{
				return true;
			}
			else
			{
				return false;
			}
		},
		logoutUser: function()
		{
			Parse.User.logOut();
		}
};




angular.module('auletta', ['ionic', 'auletta.controllers', 'auletta.services', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    //if (window.cordova && window.cordova.plugins.Keyboard) {
    //  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    //}
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/menu.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.decks', {
    url: '/decks',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-decks.html',
        controller: 'DecksCtrl'
      }
    }
  })

  .state('tab.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-settings.html',
          controller: 'SettingsCtrl'
        }
      }
    })
    
  .state('tab.addDeck', {
      url: '/addDeck',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-adddeck.html',
          controller: 'AddDeckCtrl'
        }
      }
   })  
    

  .state('tab.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/decks');

});
