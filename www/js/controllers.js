angular.module('auletta.controllers', [])

.controller('DecksCtrl', 
		function($scope, Decks, $ionicActionSheet) 
		{
			$scope.decks = Decks.all();
			console.log("Printing Decks");
			console.log($scope.decks);
			
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


.controller('AddDeckCtrl', function($scope, $ionicPlatform, $cordovaMedia, $cordovaCapture, $ionicActionSheet, $ionicPopup, Decks, $cordovaCamera, $state, $ionicHistory) {
	
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
	    			$scope.currentCard.cardAudio = audioData[0].fullPath;
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
			cardImage: "http://placehold.it/1024X768",
			cardText: "[add your text here]",
			cardAudio: ""
		}
	}
	
})

.controller('SettingsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
