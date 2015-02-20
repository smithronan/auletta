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
							cancel: function() {
								
							},
							buttonClicked: function(index) {
								return true;
							}
						}
				);
			}
			
		}		
)


.controller('AddDeckCtrl', function($scope) {
  
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
