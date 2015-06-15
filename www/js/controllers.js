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
		function($scope, $ionicModal, $rootScope, $ionicHistory, $state, $ionicLoading)
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
				$ionicLoading.show(
						{
							template: 'Logging you in...<br/><br/><i class="icon ion-loading"></i>',							
						    animation: 'fade-in',
						    showDelay: 0
						}
				);
				
				Parse.User.logIn($scope.user.email, $scope.user.password, {
					  success: function(user) {
					    localStorage.setItem("auletta_parse_id", user.id);
					    localStorage.setItem("auletta_parse_st", user._sessionToken);
					    
					    $scope.$emit('handleLogin', {childScope: $scope});
					    
					    $scope.loginModal.hide();
					    
					    $ionicLoading.hide();
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

.controller('HomeCtrl', 
		function($scope, $state, $ionicHistory, $ionicPlatform)
		{
			
			$scope.helpers = AulettaGlobal.helpers;
			
			//AndroidFullScreen.immersiveMode(function(){}, function(_err){});
			
			$ionicPlatform.registerBackButtonAction(
				function () 
				{
						//Do nothing...as opposed to exiting the app!
				}
				, 100
			);
			
			var _pEventDimensions = { screen: 'home' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
	
			$scope.homeNavigate = function(_destination)
			{
				$ionicHistory.nextViewOptions(
						{
							disableBack: true
						}
				);
				$state.go(_destination);
			}
	
		}
)

		

.controller('DecksCtrl', 
		function($scope, Decks, Global, $ionicPlatform, $ionicActionSheet, $ionicModal, $timeout, $ionicSlideBoxDelegate, $ionicLoading, $interval, $ionicHistory, $state, $cordovaMedia) 
		{
			
			$scope.helpers = AulettaGlobal.helpers;
			
			$ionicPlatform.registerBackButtonAction(
					function () 
					{
							//Do nothing...as opposed to exiting the app!
					}
					, 100
			);
			
			
			$scope.navigateTo = function(_destination)
			{
				$ionicHistory.nextViewOptions(
						{
							disableBack: true
						}
				);
				$state.go(_destination);
			}
			
			var _pEventDimensions = { screen: 'My Decks' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.showEditCardArray = [];
			$scope.toggleEditCardArray = function(_index)
			{
				if($scope.showEditCardArray[_index] == true)
				{
					$scope.showEditCardArray = [];					
				}
				else
				{
					$scope.showEditCardArray = [];
					$scope.showEditCardArray[_index] = true;
				}
			}
			
			$scope.clearEditCardArray = function()
			{
				$scope.showEditCardArray = [];
			}
						
			$scope.decks = Decks.all();
			
			$scope.preventCloseTimout = '';
			
			$scope.showSearch = false;
			
			$scope.deckFilter = '';
			
			$scope.canClosePlayer = false;
			
			$scope.imageRandomNumber = 1;
			
			$scope.onHold = function()
			{
				alert('Hold');
			}
						
			//birdInterval = $interval(function(){$scope.imageRandomNumber = Math.floor(Math.random()*(3-1+1)+1)}, 4000);
			//$scope.$on('$destroy', 
			//		function() {		          
		    //      		$interval.cancel(birdInterval);
		    //    	}
			//);
			
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
			
			$scope.playAudio = function(_audioFile)
			{
				
				$scope.media = new Media
				(
							_audioFile, 
							function()
							{
								console.log("playAudio():Audio Success");
							}, 
							function(error)
							{
								console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
							}
				);
				$scope.media.play();
			}
			
			
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
			
			
			$scope.editDeck = function(_deckId)
			{
				$scope.clearEditCardArray();
				$ionicHistory.nextViewOptions({disableBack: true});
				$state.go('tab.editDeck', {deckId: _deckId});
			}
			
			$scope.showPlayerModal = function(_deckId)
			{
				var _pEventDimensions = { screen: 'Player' };			
				$scope.helpers.trackEvent('screenview', _pEventDimensions);
				
				var _pEventDimensions = { deckId: _deckId };			
				$scope.helpers.trackEvent('play-deck', _pEventDimensions);
				
				$scope.playingDeck = Decks.get(_deckId);
				$scope.currentCardIndex = -1;
				$scope.nextCard();				
				
				window.plugins.insomnia.keepAwake();
				
				$ionicLoading.show(
						{
							template: 'Loading ' + $scope.playingDeck.deckTitle + '...<br/><br/><i class="icon ion-loading"></i>',							
						    animation: 'fade-in',
						    showDelay: 0
						}
				);
				
				
				
				$timeout( 
						function() 
						{
							$ionicSlideBoxDelegate.update();
						}, 
						50);
				
				$timeout( 
						function() 
						{
							$ionicLoading.hide();
							$scope.playingDeckReady = true;
							$scope.playerModal.show();
							$scope.currentPlayingCard = $scope.playingDeck.deckCards[0];
							$timeout( 
									function() 
									{
										$scope.playAudio($scope.currentPlayingCard.cardAudio);
									}, 
									500);
							
						}, 
						1500);
			}
			
			$scope.playerSlideChanged = function(_index)
			{
				$scope.currentPlayingCard = $scope.playingDeck.deckCards[_index];
				
				$timeout( 
						function() 
						{
							$scope.playAudio($scope.currentPlayingCard.cardAudio);
						}, 
						500);
				
				var _pEventDimensions = { };			
				$scope.helpers.trackEvent('deck-scroll', _pEventDimensions);
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
				$timeout( 
						function() 
						{
							$scope.playAudio($scope.currentPlayingCard.cardAudio);
						}, 
						1000);
			}
			
			
			$scope.toggleCanClosePlayer = function()
			{
				$scope.canClosePlayer = !$scope.canClosePlayer;
			}
			
			$scope.activatePlayerClose = function()
			{
				$scope.toggleCanClosePlayer();
				$timeout($scope.toggleCanClosePlayer, 2000);
				
				var _pEventDimensions = { };			
				$scope.helpers.trackEvent('player-close-intent', _pEventDimensions);
			}
			
			$scope.hidePlayerModal = function()
			{
				$scope.playerModal.hide();
				
				window.plugins.insomnia.allowSleepAgain();
				
				var _pEventDimensions = {  };			
				$scope.helpers.trackEvent('player-close', _pEventDimensions);
			}
			
			
			$scope.$on('$destroy', 
					function() {
			    		$scope.playerModal.remove();
			  		}
			);
			
			
			$scope.trashDeck = function(_deckId)
			{	
				var _pEventDimensions = { };			
				$scope.helpers.trackEvent('deck-delete-intent', _pEventDimensions);
				
				var hideSheet = $ionicActionSheet.show(
						{
							destructiveText: 'Delete',
							titleText: 'Are you sure you want to delete this deck?',
							cancelText: 'Cancel',
							cancel: function() 
							{
								$scope.toggleEdit();
								var _pEventDimensions = { };			
								$scope.helpers.trackEvent('deck-delete-cancel', _pEventDimensions);
							},
							buttonClicked: function(index) {
								return true;
							},
							destructiveButtonClicked: function() {
								$scope.decks = Decks.remove(_deckId);								
								$scope.clearEditCardArray();
								var _pEventDimensions = { };			
								$scope.helpers.trackEvent('deck-delete-confirm', _pEventDimensions);
								return true;
							}	
						}
				);
			}
			
		}		
)


.controller('AddDeckCtrl', function($scope, $rootScope, $ionicPlatform, $ionicLoading, $cordovaMedia, $cordovaCapture, $ionicActionSheet, $ionicPopup, Decks, $cordovaCamera, $state, $ionicHistory, $cordovaFile, $interval, Cards, $stateParams, $ionicListDelegate) {
	
	
	
	$scope.helpers = AulettaGlobal.helpers;
	
	$ionicPlatform.registerBackButtonAction(
			function () 
			{
					//Do nothing...as opposed to exiting the app!
			}
			, 100
	);
	
	var _pEventDimensions = { screen: 'Add Deck Home' };			
	$scope.helpers.trackEvent('screenview', _pEventDimensions);
	
	$scope.viewTitle = "Add New Deck";
	
	$scope.saveToGallery = false;
	
	$scope.savedCards = Cards.all();
	
	$scope.areReordering = false;
	
	$scope.processingCard = false;
	
	$scope.imageRandomNumber = Math.floor(Math.random()*(3-1+1)+1);
	birdInterval = $interval(function(){$scope.imageRandomNumber = Math.floor(Math.random()*(3-1+1)+1)}, 4000);
	$scope.$on('$destroy', 
			function() {		          
          		$interval.cancel(birdInterval);
        	}
	);
	
	$scope.selectedFromGallery = [];
	
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
	
	$scope.cardSelectionToggle = function(_cardId)
	{
		var _existsAt = $scope.selectedFromGallery.indexOf(_cardId);
		
		if(_existsAt < 0)
		{
			$scope.selectedFromGallery.push(_cardId);
		}
		else
		{
			$scope.selectedFromGallery.splice(_existsAt, 1);
		}
		
		console.log($scope.selectedFromGallery);
	}
	
	$scope.addCardsFromGallery = function()
	{
		if($scope.selectedFromGallery.length > 0)
		{
			for(var i = 0; i <= $scope.selectedFromGallery.length-1; i++) 
			{
				$scope.currentDeck.deckCards.push(Cards.get($scope.selectedFromGallery[i]));			    
			}
		}
		
		$scope.selectedFromGallery = [];
		$scope.gotoStep(4);
	}
	
	$scope.toggleReviewSaveReorder = function()
	{
		$scope.areReordering = !$scope.areReordering;
	}
	
	if($stateParams.deckId)
	{
		$scope.currentDeck = Decks.get($stateParams.deckId);
		$scope.editingDeck = true;
	}
	else
	{
		$scope.editingDeck = false;
		$scope.currentDeck = 
		{
		 	deckId: $scope.helpers.generateGUID(),
			deckTitle: "",
		 	deckDescription: "",
		 	deckThumb: "",
		 	deckCards: []
		};
	}
	
	//Object to model a blank card
	blankCard();
	
	//Controls for displaying the right content based on step
	$scope.contentStep = $scope.editingDeck ? 1 : -1;
	$scope.viewTitle = $scope.editingDeck ? "Edit Deck" : "Add New Deck";

	
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
	
	
	$scope.cancelAddDeck = function()
	{	
		var hideSheet = $ionicActionSheet.show(
				{
					destructiveText: 'Exit',
					titleText: 'Are you sure you want to exit?',
					cancelText: 'Cancel',
					cancel: function() 
					{
						
					},
					buttonClicked: function(index) {
						return true;
					},
					destructiveButtonClicked: function() {
						
						if($scope.editingDeck)
						{
							$scope.currentDeck = Decks.get($scope.currentDeck.deckId);
						}
						else
						{
							$scope.currentDeck = 
							{
							 	deckId: $scope.helpers.generateGUID(),
								deckTitle: "",
							 	deckDescription: "",
							 	deckThumb: "",
							 	deckCards: []
							};
						}
						
						$scope.gotoStep(-1);
						
						$ionicHistory.nextViewOptions(
								{
									disableBack: true
								}
						);
						
						//$state.go('tab.decks');
						
						return true;
					}	
				}
		);
	}
	
	//Process flow functions
	$scope.gotoStep = function(_stepId)
	{
		if(_stepId == 1)
		{
			var _pEventDimensions = { screen: 'Add Deck Intro' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.viewTitle = $scope.editingDeck ? "Edit Deck" : "Create Deck";
		}
		else if(_stepId == 2)
		{
			var _pEventDimensions = { screen: 'Add Deck Build Card' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.viewTitle = "Build a Card";
		}	
		else if(_stepId == 3)
		{
			var _pEventDimensions = { screen: 'Add Deck Save and Review' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.currentDeck.deckThumb = $scope.currentDeck.deckCards[0].cardImage;
			$scope.viewTitle = "Save Deck";
		}
		else if(_stepId == 0)
		{
			var _pEventDimensions = { screen: 'Add Deck Preview Card' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.viewTitle = "Preview Card";
		}
		else if(_stepId == 4)
		{
			var _pEventDimensions = { screen: 'Add Deck Add Cards' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.viewTitle = "Add Cards";
		}
		else if(_stepId == 5)
		{
			var _pEventDimensions = { screen: 'Add Deck Choose Saved Card' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
		}
		else if(_stepId == 6)
		{
			var _pEventDimensions = { screen: 'Add Deck Browse Gallery' };			
			$scope.helpers.trackEvent('screenview', _pEventDimensions);
			
			$scope.viewTitle = "Deck Gallery";
			
			$scope.deckGallery = [];
			
			$scope.showDecks(0);
		}
		
		
		$scope.contentStep = _stepId;
	}
	
	
	$scope.showDecks = function(_type)
	{
		var _message = 'Loading Deck Gallery...<br/><br/><i class="icon ion-loading"></i>'
		
		$ionicLoading.show(
    		{
    			template: _message,							
    			animation: 'fade-in',
    			showDelay: 0,
    			duration: 1500
    		}
		);
		
		if(_type === 3)
		{
			Parse.Cloud.run('myCloudDecks', {"user": Parse.User.current().id}, {
				  success: function(result) 
				  {
					  console.log(result);
					  $scope.deckGallery = result;
					  $ionicLoading.hide();
				  },
				  error: function(error) 
				  {
					  $ionicLoading.hide();
				  }
				});
		}
		else
		{
			Parse.Cloud.run('getBrowsableDecks', {"type": _type}, {
				  success: function(result) 
				  {
					  $scope.deckGallery = result;
					  $ionicLoading.hide();
				  },
				  error: function(error) 
				  {
					  $ionicLoading.hide();
				  }
				});
		}
	}
		
	
	
	$scope.cardOptionsReveal = '';
	$scope.cardOptions = function(_cardId)
	{
		if(_cardId == $scope.cardOptionsReveal)
		{
			$scope.cardOptionsReveal = '';
		}
		else
		{
			$scope.cardOptionsReveal = _cardId;
		}
		
		
		console.log($scope.cardOptionsReveal);
	}
	
	$scope.deleteCard = function(_cardId)
	{
		
		var hideSheet = $ionicActionSheet.show(
				{
					destructiveText: 'Delete',
					titleText: 'Are you sure you want to delete this card?',
					cancelText: 'Cancel',
					cancel: function() 
					{
						
					},
					buttonClicked: function(index) {
						return true;
					},
					destructiveButtonClicked: function() {
						
						var spliceAt = -1;
						
						for (var i = 0; i < $scope.currentDeck.deckCards.length; i++) 
						{
							if ($scope.currentDeck.deckCards[i].cardId === _cardId) {
								spliceAt = i;
							}
						}
						
						if(spliceAt > -1)
						{
							$scope.currentDeck.deckCards.splice(spliceAt, 1);
						}
						
						$ionicListDelegate.closeOptionButtons();
						
						return true;
					}	
				}
		);
				
	}
	
	$scope.editCard = function(_cardId)
	{
		var cardIndex = -1;
		
		console.log("Edit Card: " + _cardId);
		
		for (var i = 0; i < $scope.currentDeck.deckCards.length; i++) 
		{
			console.log($scope.currentDeck.deckCards[i].cardId);
			if ($scope.currentDeck.deckCards[i].cardId === _cardId) {
				cardIndex = i;
			}
		}
		
		$ionicListDelegate.closeOptionButtons();
		
		$scope.currentCard = $scope.currentDeck.deckCards[cardIndex];		
		$scope.editingCard = true;
		$scope.gotoStep(2);
	}
	
	
	$scope.reorderCards = function(_card, _from, _to)
	{
		var cardToMove = $scope.currentDeck.deckCards[_from];
		$scope.currentDeck.deckCards.splice(_from, 1);
		$scope.currentDeck.deckCards.splice(_to, 0, cardToMove);
	}
	
	
	$scope.saveCard = function()
	{
		if($scope.editingCard)
		{
			
			var spliceAt = -1;
			
			for (var i = 0; i < $scope.currentDeck.deckCards.length; i++) 
			{
				if ($scope.currentDeck.deckCards[i].cardId === $scope.currentCard.cardId) {
					spliceAt = i;
				}
			}
			
			if(spliceAt > -1)
			{
				$scope.currentDeck.deckCards.splice(spliceAt, 1, $scope.currentCard);
			}
			
			
			if($scope.saveToGallery)
			{
				Cards.add($scope.currentCard);
				Cards.persist();			
			}
			
			$scope.editingCard = false;
			
			blankCard();
			$scope.gotoStep(3);
		}
		else
		{			
			$scope.currentDeck.deckCards.push($scope.currentCard);
			if($scope.saveToGallery)
			{
				Cards.add($scope.currentCard);
				Cards.persist();			
			}
			blankCard();
			$scope.gotoStep(4);
		}
	}
	
	$scope.cancelBuildCard = function()
	{
		blankCard();
		if($scope.editingCard)
		{
			var _pEventDimensions = { };			
			$scope.helpers.trackEvent('cancel-edit-card', _pEventDimensions);
			
			//TODO: Reset card in case edits where in progress
			$scope.editingCard = false;
			$scope.gotoStep(3);
		}
		else
		{
			var _pEventDimensions = { };			
			$scope.helpers.trackEvent('cancel-build-card', _pEventDimensions);
			$scope.gotoStep(4);
		}		
	}
	
	$scope.toggleSaveToGallery = function()
	{
		$scope.saveToGallery = !$scope.saveToGallery;		
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
		var _pEventDimensions = { };			
		$scope.helpers.trackEvent('save-deck-intent', _pEventDimensions);
		
		if($scope.helpers.isLoggedIn())
			{
				
				if($scope.editingDeck)
				{
					Decks.remove($scope.currentDeck.deckId);
				}
				
				Decks.add($scope.currentDeck);
				Decks.persist();
				
				$scope.helpers.trackEvent('save-deck', _pEventDimensions);
				
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
				$scope.helpers.trackEvent('save-deck-login-prompt', _pEventDimensions);
				$scope.aulettaShowLoginModal();
			}
		
		
		$scope.gotoStep(1);
		
	}
	
	$scope.playAudio = function(_audioFile)
	{
		//_audioFile = $scope.helpers.getPhoneGapPath() + "sound_files/sample.mp3";
		
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
		var _pEventDimensions = { };			
		$scope.helpers.trackEvent('capture-image-intent', _pEventDimensions);
		
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
								    allowEdit: true,
								    encodingType: Camera.EncodingType.JPEG,
								    targetWidth: 640,
								    targetHeight: 960
							};

							$cordovaCamera.getPicture(options).then(
									function(imageData) 
									{
										var _pEventDimensions = { type: 'Take Photo'};			
										$scope.helpers.trackEvent('capture-image-success', _pEventDimensions);
										
										//Resize image using a canvas object
										var resizeCanvas = document.createElement('canvas');										
										resizeCanvas.width = 320;
										resizeCanvas.height = 480;
										
										var resizeContext = resizeCanvas.getContext("2d");
										var doResizeStep = 1;
										
										$scope.processingCard = true;
										
										$('#cardImage').on('load', 
												function()
												{													
													
													console.log("In Image Load");
													if(doResizeStep === 1)
													{
														var _image = $('#cardImage').get(0);
														var _naturalWidth = _image.naturalWidth; 
														var _naturalHeight = _image.naturalHeight; 
														var _naturalRatio = _naturalWidth / _naturalHeight;
														
														var imageAspectRatio = _image.naturalWidth / _image.naturalHeight;
														var canvasAspectRatio = resizeCanvas.width / resizeCanvas.height;
														var renderableHeight, renderableWidth, xStart, yStart;
														
														if(imageAspectRatio < canvasAspectRatio) 
														{
															renderableHeight = resizeCanvas.height;
															renderableWidth = _image.naturalWidth * (renderableHeight / _image.naturalHeight);
															xStart = (resizeCanvas.width - renderableWidth) / 2;
															yStart = 0;
														}
														else if(imageAspectRatio > canvasAspectRatio) 
														{
															renderableWidth = resizeCanvas.width
															renderableHeight = _image.naturalHeight * (renderableWidth / _image.naturalWidth);
															xStart = 0;
															yStart = (resizeCanvas.height - renderableHeight) / 2;
														}
														else 
														{
															renderableHeight = resizeCanvas.height;
															renderableWidth = resizeCanvas.width;
															xStart = 0;
															yStart = 0;
														}
														
														resizeContext.drawImage(_image, xStart, yStart, renderableWidth, renderableHeight);														
																												
														$scope.currentCard.cardImage = resizeCanvas.toDataURL();
														
														window.canvas2ImagePlugin.saveImageDataToLibrary(
													        function(msg){
													            console.log(msg);
													            //alert(msg);
													            $scope.currentCard.cardImage = msg;
													            $scope.currentCard.cardImagePath = msg;
													            $scope.processingCard = false;
													        },
													        function(err){
													            console.log(err);
													            //alert(err);
													        },
													        resizeCanvas
														);														
														
														doResizeStep = 2;
													}
													else if(doResizeStep === 2)
													{
														//Processing is done
														doResizeStep = 3;
													}
												}
										);
										
										
										$scope.currentCard.cardImage = "data:image/png;base64,"+imageData;
										
									}, 
									function(err) 
									{
										var _pEventDimensions = { type: 'Take Photo'};			
										$scope.helpers.trackEvent('capture-image-error', _pEventDimensions);
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
										var _pEventDimensions = { type: 'Choose Existing'};			
										$scope.helpers.trackEvent('capture-image-success', _pEventDimensions);
										
										
										//Resize image using a canvas object
										var resizeCanvas = document.createElement('canvas');										
										resizeCanvas.width = 320;
										resizeCanvas.height = 480;
										
										var resizeContext = resizeCanvas.getContext("2d");
										var doResizeStep = 1;
										
										
										$('#cardImage').on('load', 
												function()
												{													
													
													console.log("In Image Load");
													if(doResizeStep === 1)
													{
														var _image = $('#cardImage').get(0);
														var _naturalWidth = _image.naturalWidth; 
														var _naturalHeight = _image.naturalHeight; 
														var _naturalRatio = _naturalWidth / _naturalHeight;
														
														var imageAspectRatio = _image.naturalWidth / _image.naturalHeight;
														var canvasAspectRatio = resizeCanvas.width / resizeCanvas.height;
														var renderableHeight, renderableWidth, xStart, yStart;
														
														if(imageAspectRatio < canvasAspectRatio) 
														{
															renderableHeight = resizeCanvas.height;
															renderableWidth = _image.naturalWidth * (renderableHeight / _image.naturalHeight);
															xStart = (resizeCanvas.width - renderableWidth) / 2;
															yStart = 0;
														}
														else if(imageAspectRatio > canvasAspectRatio) 
														{
															renderableWidth = resizeCanvas.width
															renderableHeight = _image.naturalHeight * (renderableWidth / _image.naturalWidth);
															xStart = 0;
															yStart = (resizeCanvas.height - renderableHeight) / 2;
														}
														else 
														{
															renderableHeight = resizeCanvas.height;
															renderableWidth = resizeCanvas.width;
															xStart = 0;
															yStart = 0;
														}
														
														resizeContext.drawImage(_image, xStart, yStart, renderableWidth, renderableHeight);														
																												
														$scope.currentCard.cardImage = resizeCanvas.toDataURL();
														
														window.canvas2ImagePlugin.saveImageDataToLibrary(
													        function(msg){
													            console.log(msg);
													            //alert(msg);
													            $scope.currentCard.cardImage = msg;
													            $scope.currentCard.cardImagePath = msg;
													        },
													        function(err){
													            console.log(err);
													            //alert(err);
													        },
													        resizeCanvas
														);														
														
														doResizeStep = 2;
													}
													else if(doResizeStep === 2)
													{
														//Processing is done
														doResizeStep = 3;
													}
												}
										);
										
										
										
										$scope.currentCard.cardImage = "data:image/png;base64,"+imageData;								
									}, 
									function(err) 
									{
										var _pEventDimensions = { type: 'Choose Existing'};			
										$scope.helpers.trackEvent('capture-image-error', _pEventDimensions);
									}
							);
						}
						return true;
					}
									
				}
		);
	}
	
	$scope.toggleCardTextEntry = function()
	{
		$scope.enteringCardText = !$scope.enteringCardText;
		
		if($scope.currentCard.cardText == '[click to add text]')
		{
			$scope.currentCard.cardText = '';
		}
		else if($scope.currentCard.cardText == '')
		{
			$scope.currentCard.cardText = '[click to add text]';
		}
	}
	
	$scope.captureText = function()
	{	
		if($scope.currentCard.cardText == '[click to add text]')
		{
			$scope.currentCard.cardText = '';
		}
		
		var myPopup = $ionicPopup.show({
		    template: '<input type="text" ng-model="currentCard.cardText">',
		    title: 'Enter the text for this card',
		    scope: $scope,
		    buttons: [
		      { 
		    	  text: 'Cancel',
		    	  onTap: function(e) {		          
		    		  if($scope.currentCard.cardText == '')
		    		  {
		    			  $scope.currentCard.cardText = '[click to add text]';
		    		  }  
		    		  return $scope.currentCard.cardText;		          
			      }
		      },
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
	    			
	    			var _path = audioData[0].fullPath.substring(0, audioData[0].fullPath.lastIndexOf("/")+1);
	    			var _file = audioData[0].name;	    			
	    			var _dest = $scope.helpers.getPhoneGapPath() + "sound_files/";
	    			
	    			//alert("Attempting to move audio file: " + _path + _file + " --> " + _dest);
	    			
	    			window.resolveLocalFileSystemURI(audioData[0].fullPath,
	    				    function (fileEntry) {
	    				        
	    						function getAudioAsBase64(file) 
	    						{
	    				            var reader = new FileReader();
	    				            
	    				            reader.onloadend = 	function (evt) 
	    				            					{
	    				                					var obj = evt.target.result;
	    				                					//TODO: Do something here with the Base64 data of the audio recording!
	    				            					};
	    				            
	    				            //reader.readAsDataURL(file);
	    				        };
	    				        
	    				        var failedToGetAudioFile = function (evt) 
	    				        {
	    				        	
	    				        };
	    				        
	    				        fileEntry.file(getAudioAsBase64, failedToGetAudioFile);
	    				        
	    				        $scope.currentCard.cardAudio = fileEntry.toURL();
	    				        
	    				        var _pEventDimensions = { };			
								$scope.helpers.trackEvent('capture-audio-success', _pEventDimensions);
	    				    },	    				    
	    				    function () { }
	    				);
	    		    
	    		}, 
	    		function(err) 
	    		{
	    			// An error occurred. Show a message to the user
	    			var _pEventDimensions = { error: err};			
					$scope.helpers.trackEvent('capture-audio-error', _pEventDimensions);	    			
	    		}
	    );
	    
	}
	
	function blankCard()
	{
		$scope.currentCard = 
		{
			cardId: $scope.helpers.generateGUID(),
			cardImage: "data:image/png;base64,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",
			cardText: "[click to add text]",
			cardAudio: "",
			cardImagePath: ""
		}
	}
	
})

.controller('SettingsCtrl', function($scope, $rootScope, $ionicPlatform, $ionicActionSheet, $interval, $ionicLoading, Global, $ionicPopup, Decks) {
	$scope.helpers = AulettaGlobal.helpers;
	
	
	$scope.settingStep = 0;
	$scope.settingSubStep = 1;
	
	$scope.gotoAuthenticatedStep = function(_step)
	{
		if($scope.helpers.isLoggedIn())
		{
			$scope.gotoStep(_step);	
		}
		else
		{
			var _pEventDimensions = { };
			$scope.helpers.trackEvent('sync-decks-login-prompt', _pEventDimensions);
			$scope.aulettaShowLoginModal();
		}
	}
	
	
	
	$scope.gotoStep = function(_step)
	{
		$scope.settingStep = _step;
		
		if($scope.settingSubStep == 3)
		{
			//Cloud Backup / Restore
			$ionicLoading.show(
    				{
    					template: 'Retrieving your Decks from Cloud...<br/><br/><i class="icon ion-loading"></i>',							
    				    animation: 'fade-in',
    				    showDelay: 0    				    
    				}
    		);
			
			Parse.Cloud.run('myCloudDecks', {"user": Parse.User.current().id}, {
				  success: function(result) 
				  {  
					  $scope.deckGallery = result;
					  console.log(result);
					  
					  
					  $ionicLoading.hide();
				  },
				  error: function(error) 
				  {
					  $ionicLoading.hide();
				  }
			});
		}
		
	}	
	
	$scope.gotoSubStep = function(_step)
	{
		$scope.settingSubStep = _step;
		
		if($scope.settingSubStep == 3)
		{
			//Cloud Backup / Restore
			$ionicLoading.show(
    				{
    					template: 'Retrieving your Decks from Cloud...<br/><br/><i class="icon ion-loading"></i>',							
    				    animation: 'fade-in',
    				    showDelay: 0    				    
    				}
    		);
			
			Parse.Cloud.run('myCloudDecks', {"user": Parse.User.current().id}, {
				  success: function(result) 
				  {  
					  $scope.deckGallery = result;
					  console.log(result);
					  
					  
					  $ionicLoading.hide();
				  },
				  error: function(error) 
				  {
					  $ionicLoading.hide();
				  }
			});
		}
		
	}
	
	
	$ionicPlatform.registerBackButtonAction(
			function () 
			{
					//Do nothing...as opposed to exiting the app!
			}
			, 100
	);
	
	var _pEventDimensions = { screen: 'settings' };			
	$scope.helpers.trackEvent('screenview', _pEventDimensions);

	
	$scope.childModePin = { value: "" };
	
	//Needs to be globalized
	$scope.childModeEnabled = $rootScope.childModeEnabled;
		
	
	$scope.isLoggedIn = $scope.helpers.isLoggedIn();
		
	$scope.$on('loginBroadcast', function(event, args) {
        console.log("LoginBroadcast");
		$scope.isLoggedIn = true;
    });  
	
	$scope.$on('signupBroadcast', function(event, args) {
        console.log("SignupBroadcast");
		$scope.isLoggedIn = true;
    });  
	
	$scope.toggleChildMode = function()
	{
		var _message = $scope.childModeEnabled ? 'Turning Off Child Mode...<br/><br/><i class="icon ion-loading"></i>' : 'Turning On Child Mode...<br/><br/><i class="icon ion-loading"></i>' 
		
		if($scope.childModeEnabled)
		{
			
			var myPopup = $ionicPopup.show({
			    template: '<input type="password" ng-model="childModePin.value">',
			    title: 'Enter the PIN to exit Child Mode',
			    scope: $scope,
			    buttons: [
			      { 
			    	  text: 'Cancel',
			    	  onTap: function(e) {
			    		  return;		          
				      }
			      },
			      {
			        text: '<b>Ok</b>',
			        type: 'button-positive',
			        onTap: function(e) {		          
			            console.log($scope.childModePin.value);
			        	
			        	if($scope.childModePin.value == "8888")
			            {
			            	$ionicLoading.show(
			        				{
			        					template: _message,							
			        				    animation: 'fade-in',
			        				    showDelay: 0,
			        				    duration: 1500
			        				}
			        		);
			            	
			            	$rootScope.childModeEnabled = false;
			            	$scope.childModeEnabled = false;
			            	
			            	var _pEventDimensions = { };			
							$scope.helpers.trackEvent('child-mode-disabled', _pEventDimensions);
			            }	          
			        }
			      }
			    ]
			  });
			
			
		}
		else
		{
			$ionicLoading.show(
					{
						template: _message,							
					    animation: 'fade-in',
					    showDelay: 0,
					    duration: 1500
					}
			);
			$rootScope.childModeEnabled = true;
			$scope.childModeEnabled = true;
			
			var _pEventDimensions = { };			
			$scope.helpers.trackEvent('child-mode-enabled', _pEventDimensions);
		}		
		
	}
	
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
	
	
	$scope.backupPrompt = function()
	{
		
		var hideSheet = $ionicActionSheet.show(
				{
					buttons: [
					          { text: 'Backup Decks to Cloud' }					          
					],
					titleText: 'Are you sure you want to Backup your Decks?',
					cancelText: 'Cancel',
					cancel: function() 
					{	
						var _pEventDimensions = { };			
						$scope.helpers.trackEvent('cloud-backup-cancel', _pEventDimensions);
					},
					buttonClicked: function(index) {
						console.log(index);
						if(index === 0)
						{	
							$scope.saveDecksToCloud();
						}
						return true;
					}						
				}
		);
	}
	
	$scope.restorePrompt = function()
	{
		
		var hideSheet = $ionicActionSheet.show(
				{
					buttons: [
					          { text: 'Restore Decks from Cloud' }					          
					],
					titleText: 'Are you sure you want to Restore your Decks from the Cloud?',
					cancelText: 'Cancel',
					cancel: function() 
					{	
						var _pEventDimensions = { };			
						$scope.helpers.trackEvent('cloud-restore-cancel', _pEventDimensions);
					},
					buttonClicked: function(index) {
						console.log(index);
						if(index === 0)
						{	
							$scope.restoreDecksFromCloud();
						}
						return true;
					}						
				}
		);
	}
	
	
	$scope.restoreDecksFromCloud = function(_deckId)
	{
		$rootScope.decksDownloading = 1;
		$rootScope.cardsDownloading = 0;
		
		$ionicLoading.show(
				{
					template: 'Restoring Decks from Cloud...<br/><br/><i class="icon ion-loading"></i>',							
				    animation: 'fade-in',
				    showDelay: 0    				    
				}
		);
		
		if(_deckId)
		{
			Decks.restoreSingleFromCloud(_deckId);
		}
		else
		{
			Decks.restoreFromCloud();
		}
		
		var _saveMonitorPromise;
		
		$scope.startSaveMonitor = function() {
	      $scope.stopSaveMonitor(); 		      
	      _saveMonitorPromise = $interval(
	    		  function()
	    		  {
	    			  if($rootScope.decksDownloading < 1 && $rootScope.cardsDownloading < 1)
	    			  {
	    				  $ionicLoading.hide();
	    				  $scope.stopSaveMonitor();	
	    			  }
	    		  }, 1000);
	    };
	  
	    // stops the interval
	    $scope.stopSaveMonitor = function() {
	      $interval.cancel(_saveMonitorPromise);
	    };
	  
	    $scope.startSaveMonitor();
		
		
		
	}
	
	$scope.cloudDelete = function(_deckId, _parseObjectId)
	{
		var hideSheet = $ionicActionSheet.show(
				{
					buttons: [
					          { text: 'Delete on Device only' },
					          { text: 'Delete in Cloud only' },
					          { text: 'Delete from Cloud and Device' },
					],
					titleText: 'Are you sure you want to delete this deck?',
					cancelText: 'Cancel',
					cancel: function() 
					{	
						var _pEventDimensions = { };
					},
					buttonClicked: function(index) {						
						if(index === 0)
						{	
							Decks.remove(_deckId);
							Decks.persist();
						}
						else if(index === 1)
						{
							console.log("Delete deck: " + _deckId + " with parse object id: " + _parseObjectId);
							Decks.cloudDelete(_parseObjectId, _deckId);
						}
						else if(index === 2)
						{
							Decks.remove(_deckId);
							Decks.persist();
							
							Decks.cloudDelete(_parseObjectId);
						}
						return true;
					}						
				}
		);
	}
	
	$scope.deckRestoreSingle = function(_deckId, _parseObjectId)
	{
		var hideSheet = $ionicActionSheet.show(
				{
					buttons: [
					          { text: 'Restore Deck' },					          
					],
					titleText: 'Restore this deck from cloud?',
					cancelText: 'Cancel',
					cancel: function() 
					{	
						var _pEventDimensions = { };
					},
					buttonClicked: function(index) {						
						if(index === 0)
						{	
							$scope.restoreDecksFromCloud(_deckId);
						}						
						return true;
					}						
				}
		);
	}
	
	
	$scope.saveDecksToCloud = function()
	{
		if($scope.helpers.isLoggedIn())
		{
			var _decksToSync = Decks.all();
			
			$ionicLoading.show(
    				{
    					template: 'Backing Up Decks to Cloud...<br/><br/><i class="icon ion-loading"></i>',							
    				    animation: 'fade-in',
    				    showDelay: 0    				    
    				}
    		);
			
			$rootScope.decksCurrentlySaving = 0;
			$rootScope.cardsCurrentlySaving = 0;
			
			//Loop through each of the decks
			for (var i = 0; i < _decksToSync.length; i++) 
			{
				console.log("Calling save for deck: " + _decksToSync[i].deckId);
				
				$rootScope.decksCurrentlySaving++;
				Decks.saveToCloud(_decksToSync[i]);
								
				Decks.markCardsReplaced(_decksToSync[i].deckId);
				
				//Queue the deck cards individually for saving
				for(var x=0; x<_decksToSync[i].deckCards.length; x++)
				{
					$rootScope.cardsCurrentlySaving++;					
					Decks.saveCardToCloud(_decksToSync[i].deckCards[x], x, _decksToSync[i].deckId);
				}				
			}
			
			var _saveMonitorPromise;
			
			$scope.startSaveMonitor = function() {
		      $scope.stopSaveMonitor(); 		      
		      _saveMonitorPromise = $interval(
		    		  function()
		    		  {
		    			  if($rootScope.decksCurrentlySaving < 1 && $rootScope.cardsCurrentlySaving < 1)
		    			  {
		    				  $ionicLoading.hide();
		    				  $scope.stopSaveMonitor();	
		    			  }
		    		  }, 1000);
		    };
		  
		    // stops the interval
		    $scope.stopSaveMonitor = function() {
		      $interval.cancel(_saveMonitorPromise);
		    };
		  
		    $scope.startSaveMonitor();
		}
		else
		{
			var _pEventDimensions = { };
			$scope.helpers.trackEvent('sync-decks-login-prompt', _pEventDimensions);
			$scope.aulettaShowLoginModal();
		}
	}
})

.controller('AboutCtrl', function($scope, $timeout, $cordovaFileTransfer, Decks, $cordovaFile) {
	
	$scope.decks = Decks.all();
	
	$scope.testResults = "[Run tests to see results here...if applicable]";
	
	//We'll use this as a handy way to run code on the device that may be difficult to re-create the scenarios
	//for in a natural sense!
	$scope.testHarness = 
		function()
		{
			console.log($scope.decks[0].deckCards[0].cardImage);
			$scope.testResults = $scope.decks[0].deckCards[0].cardImage;
			
			window.resolveLocalFileSystemURL(
				"file://" + $scope.decks[0].deckCards[0].cardImage, 
				function(fileEntry) 
				{
					console.log("Got File");
					fileEntry.file(
						function(file) 
						{
							var reader = new FileReader();

							reader.onloadend = function(event) {
								console.log("File Content - B64: " + event.target.result);								
							}

							reader.readAsDataURL(file);
						}
					)
				}, 
				function(e) 
				{
					console.log("FileSystem Error");
					for (var key in e) 
					{
					  if (e.hasOwnProperty(key)) 
					  {
						console.log(key + " -> " + e[key]);
					  }
					}
				}
			);
			
			
			
		}	
});