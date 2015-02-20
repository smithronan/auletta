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


.controller('AddDeckCtrl', function($scope, $ionicPlatform, $cordovaMedia, $cordovaCapture) {
	
	$scope.helpers = AulettaGlobal.helpers;
	$scope.success = "";
	$scope.src = "";
	
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
	
		
	
	$scope.playAudio = function()
	{
		$scope.media.play();
	}
	
	$scope.captureImage = function()
	{
		var options = { limit: 1 };

	    $cordovaCapture.captureImage(options).then(function(imageData) {
	      console.log(imageData);
	    }, function(err) {
	      console.log("An error occurred capturing image");
	    });
	}
	
	$scope.captureAudio = function()
	{
		
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
