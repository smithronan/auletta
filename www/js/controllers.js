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


.controller('AddDeckCtrl', function($scope, $ionicPlatform, $cordovaMedia) {
	
	
	
	$scope.recordAudio = function()
	{
		$ionicPlatform.ready(
				function() 
				{
					
					var src = "http://www.stephaniequinn.com/Music/Commercial%20DEMO%20-%2013.mp3";
					var media = $cordovaMedia.newMedia(src).then(
							function() {
								// success
							}, 
							function () {
							   // error
							}
					);


					//media.play(options); // iOS only!
					media.play(); // Android

					//media.pause();

					//media.stop();

					//media.release();

					//media.seekTo(5000); // milliseconds value

					//media.setVolume(0.5);

					//media.startRecord();

					setTimeout(
								function() 
								{
									media.stopRecord();
								}, 5000
					);		
			
				}
		);
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
