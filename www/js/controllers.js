angular.module('auletta.controllers', [])

.controller('DecksCtrl', 
		function($scope, Decks, $ionicActionSheet) 
		{
			$scope.decks = Decks.all();
			
			
			
			
			$scope.toggleReorder = function()
			{
				$scope.shouldShowReorder = !$scope.shouldShowReorder;
			}
			
			$scope.toggleEdit = function()
			{
				$scope.shouldShowDelete = !$scope.shouldShowDelete;
			}
			
			$scope.trashDeck = function(_deckId)
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
							}
						}
				);
			}
			
		}		
)


.controller('AddDeckCtrl', function($scope, $ionicPlatform, $cordovaMedia, $cordovaCapture, $ionicActionSheet, $ionicPopup, Decks, $cordovaCamera) {
	
	$scope.helpers = AulettaGlobal.helpers;
	
	$scope.success = "";
	$scope.src = "";
	
	$scope.deck = 
		{
		 	deckTitle: "",
		 	deckDescription: "",
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
				
												
			}
	);
	
		
	//Process flow functions
	$scope.gotoStep = function(_stepId)
	{
		$scope.contentStep = _stepId;
	}
	
	$scope.saveCard = function()
	{
		$scope.deck.deckCards.push($scope.currentCard);
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
		Decks.add($scope.deck);
	}
	
	$scope.playAudio = function()
	{
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
		
	}
	
	function blankCard()
	{
		$scope.currentCard = 
		{
			cardImage: "http://placehold.it/350x150",
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
