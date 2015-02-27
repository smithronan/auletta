angular.module('auletta.controllers', [])

.run(function($rootScope) {
    $rootScope.$on('handleLogout', function(event, args) {
        $rootScope.$broadcast('logoutBroadcast', args);
    });
    
    $rootScope.$on('handleLogin', function(event, args) {
        console.log("RootScope: handleLogin");
    	$rootScope.$broadcast('loginBroadcast', args);
    });
    
    $rootScope.$on('handleSignup', function(event, args) {
        console.log("RootScope: handleSignup");
    	$rootScope.$broadcast('signupBroadcast', args);
    });
})

.controller('AulettaCtrl', 
		function($scope, $ionicModal, $rootScope, $ionicHistory, $state)
		{
			$scope.helpers = AulettaGlobal.helpers;
			
			console.log($rootScope.loggedInStatus);
			
			$scope.user = {};
	
			var accountModalPageTitles = ["Login to your account", "Signup for an account"];
			
			$scope.accountModalPageMode = 0;
			$scope.accountModalPageTitle = accountModalPageTitles[$scope.accountModalPageMode];
			
			
			$ionicModal.fromTemplateUrl('templates/account-modal.html', 
					{
						scope: $scope,
						animation: 'slide-in-up',
						focusFirstInput: true,
						backdropClickToClose: false
					}
			).then(
					function(modal) {
						$scope.loginModal = modal;
					}
			);
			
			$scope.toggleLoginSignup = function()
			{
				$scope.accountModalPageMode = ($scope.accountModalPageMode==0) ? 1 : 0;
				$scope.accountModalPageTitle = accountModalPageTitles[$scope.accountModalPageMode];
			}
			
			$scope.$on('logoutBroadcast', function(event, args) {
		        $scope.helpers.logoutUser();
		        localStorage.removeItem("auletta_parse_id");
			    localStorage.removeItem("auletta_parse_st");			    
				args.childScope.isLoggedIn = $scope.helpers.isLoggedIn();
		    });     
			
			
			$scope.doLogin = function()
			{	
				Parse.User.logIn($scope.user.email, $scope.user.password, {
					  success: function(user) {
					    localStorage.setItem("auletta_parse_id", user.id);
					    localStorage.setItem("auletta_parse_st", user._sessionToken);
					    
					    $scope.$emit('handleLogin', {childScope: $scope});
					    
					    $scope.loginModal.hide();
					  },
					  error: function(user, error) {					    
					    alert("Sorry, but your login failed.");
					  }
					});
			}
			
			$scope.doSignup = function()
			{
				var user = new Parse.User();
				user.set("username", $scope.user.email);
				user.set("password", $scope.user.password);
				user.set("email", $scope.user.email);
				  
				// other fields can be set just like with Parse.Object
				user.set("fullname", $scope.user.name);
				  
				user.signUp(null, {
				  success: function(user) {
				    //alert("You are now signed up as " + $scope.user.email);
				    $scope.$emit('handleSignup', {childScope: $scope});
				    $scope.loginModal.hide();
				  },
				  error: function(user, error) {
				    // Show the error message somewhere and let the user try again.
				    alert("Error: " + error.code + " " + error.message);
				  }
				});
			}
			
			$scope.aulettaShowLoginModal = function()
			{
				  $scope.loginModal.show();
			}
			
			$scope.aulettaHideLoginModal = function()
			{
				  $scope.loginModal.hide();
			}
			
			$scope.$on('$destroy', 
					function() {
			    		$scope.loginModal.remove();
			  		}
			);
			
			$scope.loginStatus = $scope.helpers.isLoggedIn();
			
		}
)

.controller('AccountCtrl', 
		function($scope)
		{
			
		}
)

		

.controller('DecksCtrl', 
		function($scope, Decks, $ionicActionSheet, $ionicModal) 
		{
			
			$scope.decks = Decks.all();
			
			$scope.preventCloseTimout = '';
			
			$scope.showSearch = false;
			
			$scope.deckFilter = '';
			
			$ionicModal.fromTemplateUrl('templates/player-modal.html', 
					{
						scope: $scope,
						animation: 'slide-in-up',
						backdropClickToClose: false
					}
			).then(
					function(modal) {
						$scope.playerModal = modal;
					}
			);			
			
			$scope.toggleSearch = function()
			{
				$scope.showSearch = !$scope.showSearch;
			}
			
			$scope.toggleReorder = function()
			{
				$scope.shouldShowReorder = !$scope.shouldShowReorder;
			}
			
			$scope.toggleEdit = function()
			{
				$scope.shouldShowDelete = !$scope.shouldShowDelete;
			}
			
			$scope.reorderItem = function(_deck, _from, _to)
			{
				console.log("Move " + _deck.deckId + " from " + _from + " to " + _to);
				Decks.reorder(_deck.deckId, _from, _to);
				Decks.persist();
			}
			
			$scope.showPlayerModal = function(_deckId)
			{
				$scope.playingDeck = Decks.get(_deckId);
				$scope.currentCardIndex = -1;
				$scope.nextCard();				
								
				$scope.playerModal.show();
			}
			
			$scope.nextCard = function()
			{
				$scope.currentCardIndex = ($scope.currentCardIndex < $scope.playingDeck.deckCards.length-1) ? $scope.currentCardIndex + 1 : 0;
				$scope.currentPlayingCard = $scope.playingDeck.deckCards[$scope.currentCardIndex];				
			}
			
			$scope.prevCard = function()
			{
				$scope.currentCardIndex = ($scope.currentCardIndex > 0) ? $scope.currentCardIndex - 1 : $scope.playingDeck.deckCards.length-1;
				$scope.currentPlayingCard = $scope.playingDeck.deckCards[$scope.currentCardIndex];				
			}
			
			$scope.hidePlayerModal = function()
			{
				//$scope.closePlayerCount++;
				
				//if($scope.closePlayerCount >= 5)
				//{
					$scope.playerModal.hide();
				//	$scope.closePlayerCount = 0;
				//	clearTimeout($scope.preventCloseTimeout);
				//}
				//else
				//{
				//	$scope.preventCloseTimeout = $scope.preventCloseTimeout || setTimeout(function(){$scope.closePlayerCount = 0}, 2000);
				//}
			}
			
			
			$scope.$on('$destroy', 
					function() {
			    		$scope.playerModal.remove();
			  		}
			);
			
			
			$scope.trashDeck = function(_deck)
			{	
				var hideSheet = $ionicActionSheet.show(
						{
							destructiveText: 'Delete',
							titleText: 'Are you sure you want to delete this deck?',
							cancelText: 'Cancel',
							cancel: function() 
							{
								$scope.toggleEdit();
							},
							buttonClicked: function(index) {
								return true;
							},
							destructiveButtonClicked: function() {
								$scope.decks = Decks.remove(_deck.deckId);
								Decks.persist();
								$scope.toggleEdit();
								return true;
							}	
						}
				);
			}
			
		}		
)


.controller('AddDeckCtrl', function($scope, $rootScope, $ionicPlatform, $cordovaMedia, $cordovaCapture, $ionicActionSheet, $ionicPopup, Decks, $cordovaCamera, $state, $ionicHistory, $cordovaFile) {
	
	$scope.helpers = AulettaGlobal.helpers;
	
	$scope.viewTitle = "Add New Deck";
	
	$scope.success = "";
	$scope.src = "";
	
	$scope.showPreview = false;
	$scope.togglePreview = function()
	{
		$scope.showPreview = !$scope.showPreview;
		if($scope.contentStep == 2)
		{
			$scope.contentStep = 0;
			$scope.viewTitle = "Preview Card";
		}
		else
		{
			$scope.contentStep = 2;
			$scope.viewTitle = "Add Cards";
		}
	}
	
	$scope.currentDeck = 
		{
		 	deckId: $scope.helpers.generateGUID(),
			deckTitle: "",
		 	deckDescription: "",
		 	deckThumb: "",
		 	deckCards: []
		};	
	
	
	//Object to model a blank card
	blankCard();	
	
	//Controls for displaying the right content based on step
	$scope.contentStep = 1;
	

	
	$ionicPlatform.ready(
			function() 
			{
				
				console.log("IonicPlatform Ready");
				$scope.success = "Platform Ready";
				
				//Load a sample sound
				$scope.src = $scope.helpers.getPhoneGapPath() + "sound_files/sample.mp3";
				/*
				$scope.media = new Media
							(
										$scope.src, 
										function()
										{
											console.log("playAudio():Audio Success");
										}, 
										function(error)
										{
											alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
										}
							);
				*/
												
			}
	);
	
		
	//Process flow functions
	$scope.gotoStep = function(_stepId)
	{
		if(_stepId == 1)
		{
			$scope.viewTitle = "Add New Deck";
		}
		else if(_stepId == 2)
		{
			$scope.viewTitle = "Add Cards";
		}	
		else if(_stepId == 3)
		{
			$scope.viewTitle = "Review &amp; Save";
		}
		else if(_stepId == 0)
		{
			$scope.viewTitle = "Preview Card";
		}
		
		$scope.contentStep = _stepId;
	}
	
	$scope.saveCard = function()
	{
		$scope.currentDeck.deckCards.push($scope.currentCard);
		blankCard();
	}
	
	$scope.resetToBlankCard = function()
	{
		var actionSheet = $ionicActionSheet.show(
				{
					destructiveText: 'Reset',
					titleText: 'Are you sure you want to reset this card?',
					cancelText: 'Cancel',
					cancel: function() 
					{
						
					},
					destructiveButtonClicked: function() {
						blankCard();
						return true;
					}					
				}
		);
	}
	
	$scope.saveDeck = function()
	{
		$scope.currentDeck.deckThumb = $scope.currentDeck.deckCards[0].cardImage;
		if($scope.helpers.isLoggedIn())
			{
				Decks.add($scope.currentDeck);
				Decks.persist();
				
				console.log(Decks.all());
				
				$ionicHistory.nextViewOptions(
						{
							disableBack: true
						}
				);
				$state.go('tab.decks');
			}
		else
			{
				$scope.aulettaShowLoginModal();
			}
	}
	
	$scope.playAudio = function(_audioFile)
	{
		_audioFile = $scope.helpers.getPhoneGapPath() + "sound_files/sample.mp3";
		
		$scope.media = new Media
		(
					_audioFile, 
					function()
					{
						console.log("playAudio():Audio Success");
					}, 
					function(error)
					{
						alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
					}
		);
		$scope.media.play();
	}
	
	$scope.captureImage = function()
	{
		
		var actionSheet = $ionicActionSheet.show(
				{
					buttons: [
					          { text: 'Take Photo' },
					          { text: 'Choose Existing' }
					        ],
					titleText: 'Add an image to your card',
					cancelText: 'Cancel',
					cancel: function() 
					{
						
					},
					buttonClicked: function(index) 
					{
						if(index == 0)
						{
							//Capture new
							var options = 
							{
									destinationType: Camera.DestinationType.DATA_URL,
								    sourceType: Camera.PictureSourceType.CAMERA,
							};

							$cordovaCamera.getPicture(options).then(
									function(imageData) 
									{
										$scope.currentCard.cardImage = "data:image/png;base64,"+imageData;								
									}, 
									function(err) 
									{
										// error
									}
							);
						}
						else if(index == 1)
						{
							//Existing photo
							var options = 
							{
									destinationType: Camera.DestinationType.DATA_URL,
								    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
							};

							$cordovaCamera.getPicture(options).then(
									function(imageData) 
									{
										$scope.currentCard.cardImage = "data:image/png;base64,"+imageData;								
									}, 
									function(err) 
									{
										// error
									}
							);
						}
						return true;
					}
									
				}
		);
	}
	
	$scope.captureText = function()
	{
		if($scope.currentCard.cardText == '[add your text here]')
		{
			$scope.currentCard.cardText = '';
		}
		
		var myPopup = $ionicPopup.show({
		    template: '<input type="text" ng-model="currentCard.cardText">',
		    title: 'Enter the text for this card',
		    scope: $scope,
		    buttons: [
		      { text: 'Cancel' },
		      {
		        text: '<b>Ok</b>',
		        type: 'button-positive',
		        onTap: function(e) {		          
		            return $scope.currentCard.cardText;		          
		        }
		      }
		    ]
		  });
	}
	
	$scope.captureAudio = function()
	{
		var options = { limit: 1, duration: 10 };

	    $cordovaCapture.captureAudio(options).then(
	    		function(audioData) {
	    			// Success! Audio data is here
	    			
	    			var _path = audioData[0].fullPath.substring(0, audioData[0].fullPath.lastIndexOf("/"));
	    			var _file = audioData[0].name;	    			
	    			var _dest = $scope.helpers.getPhoneGapPath() + "sound_files/";
	    			
	    			alert("Attempting to move audio file: " + _path + _file + " --> " + _dest);
	    			
	    			 $cordovaFile.copyFile(_path, _file, _dest)
	    		      .then(function (success) {
	    		    	  $scope.currentCard.cardAudio = _dest + _file;
	    		    	  alert("File moved: " + _path + _file + " --> " + _dest);
	    		      }, function (error) {
	    		        alert("Unable to move audio file: " + _path + _file + " --> " + _dest);
	    		      });
	    		}, 
	    		function(err) {
	    			// An error occurred. Show a message to the user
	    			alert(err);
	    		}
	    );
	}
	
	function blankCard()
	{
		$scope.currentCard = 
		{
			cardImage: "http://lorempixel.com/640/960/animals/" + Math.floor((Math.random() * 10) + 1),
			cardText: "[add your text here]",
			cardAudio: ""
		}
	}
	
})

.controller('SettingsCtrl', function($scope, $rootScope, $ionicActionSheet) {
	$scope.helpers = AulettaGlobal.helpers;
	
	$scope.isLoggedIn = $scope.helpers.isLoggedIn();
		
	$scope.$on('loginBroadcast', function(event, args) {
        console.log("LoginBroadcast");
		$scope.isLoggedIn = true;
    });  
	
	$scope.$on('signupBroadcast', function(event, args) {
        console.log("SignupBroadcast");
		$scope.isLoggedIn = true;
    });  
	
	$scope.broadcastLogout = function()
							{
		 						
								var hideSheet = $ionicActionSheet.show(
										{
											destructiveText: 'Logout',
											titleText: 'Are you sure you want to logout?',
											cancelText: 'Cancel',
											cancel: function() 
											{
												
											},
											buttonClicked: function(index) {
												return true;
											},
											destructiveButtonClicked: function() {
												$scope.$emit('handleLogout', {childScope: $scope});
												return true;
											}	
										}
								);
							}
	
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});