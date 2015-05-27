angular.module('auletta.services', [])


.factory('Global', function($rootScope){

	var childModeEnabled = childModeEnabled || true;
	
	return {
		
		enableChildMode: function()
			{
				childModeEnabled = true;				
				return childModeEnabled;
			},
		disableChildMode: function()
			{
				childModeEnabled = false;				
				return childModeEnabled;
			},
		childModeStatus: function()
			{	
				return childModeEnabled;		
			}
	}
	
}
)


.factory('Decks', function($rootScope) {
	// Some fake testing data
	var ls_decks = JSON.parse(localStorage.getItem("auletta_decks"));
	
	var decks = (ls_decks !== null) ? ls_decks : [];	

	return {
		all: function() {
			return decks;
		},
		reorder: function(_deckId, _from, _to)
		{
			var deckToMove = decks[_from];
			decks.splice(_from, 1);
			decks.splice(_to, 0, deckToMove);
			return decks;
		},
		remove: function(_deckId) {
			var spliceAt = -1;
			
			for (var i = 0; i < decks.length; i++) 
			{
				if (decks[i].deckId === _deckId) {
					spliceAt = i;
				}
			}
			
			if(spliceAt > -1)
			{
				decks.splice(spliceAt, 1);
			}
			
			return decks
		},
		get: function(deckId) {
			for (var i = 0; i < decks.length; i++) {
				if (decks[i].deckId === deckId) {
					return decks[i];
				}
			}
			return null;
		},
		add: function(deck)
		{
			decks.unshift(deck);
		},
		persist: function()
		{
			localStorage.setItem("auletta_decks", JSON.stringify(decks));
		},
		allAsJson: function()
		{
			return JSON.stringify(decks);
		},
		markCardsReplaced: function(_deckId)
		{
			var _userId = Parse.User.current().id;
			
			var query = new Parse.Query("UserDeckCard");
		    query.equalTo("deckId", _deckId);
		    query.equalTo("userId", _userId);
		    
		    query.each(
			    		function(obj) 
			    		{
			    			obj.set("cardReplaced", true);
			    			return obj.save();
			    		}
		    ).then(
		    			function() {
		    				var delQuery = new Parse.Query("UserDeckCard");
		    				delQuery.equalTo("deckId", _deckId);
		    				delQuery.equalTo("userId", _userId);
		    				delQuery.equalTo("cardReplaced", true);

		    				delQuery.find().then(
		    						function(cards) 
		    						{
		    							return Parse.Object.destroyAll(cards);
		    						}
		    				).then(
		    						function(success) 
		    						{
		    							// The related comments were deleted
		    						}, 
		    						function(error) {
		    							console.error("Error deleting replaced cards " + error.code + ": " + error.message);
		    						}
		    				);	
		    	
		    	
		    			}, 
		    			function(err) {
		    				console.log(err);
		    			}
		    );
		},
		saveCardToCloud: function(_card, _order, _deckId)
		{
			var _userId = Parse.User.current().id;
			
			var UserDeckCard = Parse.Object.extend("UserDeckCard");
			var userDeckCard = new UserDeckCard();
			
			var _cardChecksumString = _card.cardId + _card.cardImage + _card.cardText + _card.cardAudio + _order;
	    	_cardLocalChecksum = AulettaGlobal.helpers.crc32(_cardChecksumString);
			
			userDeckCard.save(
					{
						userId: _userId,
						cardId: _card.cardId,
						cardImage: _card.cardImage,									
						cardText: _card.cardText,
						cardAudio: _card.cardAudio,
						cardReplaced: false,
						cardOrder: _order,
						deckId: _deckId,
						cardCrc32: _cardLocalChecksum										  
					}, 
					{
						success: function(_newCard) {
							console.log(_newCard);
							$rootScope.cardsCurrentlySaving--;
						},
						error: function(_userDeckList, _error) {
							_errorState = true;
							$rootScope.cardsCurrentlySaving--;
						}
					}
			);
		},
		saveToCloud: function(_deck)
		{
			var UserDeckList = Parse.Object.extend("UserDeckList");
			var userDeckList = new UserDeckList();
			
			var _userId = Parse.User.current().id;
			
			var _deckChecksumString = _deck.deckTitle + _deck.deckThumb + _deck.deckId + _deck.deckDescription + _deck.deckCards.length;
			var _crc = AulettaGlobal.helpers.crc32(_deckChecksumString);
			
			console.log("Decks Currently Saving: " + $rootScope.decksCurrentlySaving);
			
			var UserDeckExistsQuery = Parse.Object.extend("UserDeckList");
			var query = new Parse.Query(UserDeckExistsQuery);
			query.equalTo("deckId", _deck.deckId);
			query.equalTo("userId", _userId);
			
			query.find({
				  success: function(results) {
				    if(results.length > 0)
				    {					    	
				    	var _cloudDeckCrc32 = results[0]._serverData.deckCrc32;
				    	var _deckParseId = results[0].id;
				    	
				    	if(_cloudDeckCrc32 !== _crc)
				    	{
				    		console.log("Deck: " + _deck.deckId + " exists in the cloud but has changed....updating");
				    		var DeckToUpdate = Parse.Object.extend("UserDeckList");
							var query = new Parse.Query(DeckToUpdate);
							query.get(_deckParseId, {
							  success: function(deck) {
							    deck.set("deckTitle", _deck.deckTitle);
							    deck.set("deckThumb", _deck.deckThumb);
							    deck.set("deckDescription", _deck.deckDescription);
							    deck.set("deckCrc32", _crc);
							    deck.save();
							    $rootScope.decksCurrentlySaving--;
							  },
							  error: function(object, error) {
							    // The object was not retrieved successfully.
							    // error is a Parse.Error with an error code and message.
								$rootScope.decksCurrentlySaving--;  
							  }
							});
				    	}
				    	else
				    	{
				    		console.log("Deck: " + _deck.deckId + " exists in the cloud and has not changed.");
				    		$rootScope.decksCurrentlySaving--;
				    	}
				    }
				    else
				    {
				    	//If this deck does not exist in the cloud then save it now
				    	console.log("Deck: " + _deck.deckId + " does not exist in the cloud....saving");
				    	userDeckList.save(
								{
									userId: _userId,
									deckTitle: _deck.deckTitle,
									deckThumb: _deck.deckThumb,
									deckId: _deck.deckId,
									deckDescription: _deck.deckDescription,
									deckCrc32: _crc
								}, 
								{
									success: function(_userDeckList) {
										console.log(_userDeckList);
										$rootScope.decksCurrentlySaving--;
										console.log("Decks Currently Saving: " + $rootScope.decksCurrentlySaving);
									},
									error: function(_userDeckList, _error) {
										console.log(_error);
										_errorState = true;
										$rootScope.decksCurrentlySaving--;
										console.log("Decks Currently Saving: " + $rootScope.decksCurrentlySaving);
									}
								}
						);
				    }
				  },
				  error: function(error) {
					    alert("Error: " + error.code + " " + error.message);
					  }
			});
		}
	}
})


.factory('Cards', function() {
	var ls_cards = JSON.parse(localStorage.getItem("auletta_cards"));
	
	var cards = (ls_cards !== null) ? ls_cards : [];	

	return {
		all: function() {
			return cards;
		},		
		get: function(cardId) {
			for (var i = 0; i < cards.length; i++) {
				if (cards[i].cardId === cardId) {
					return cards[i];
				}
			}
			return null;
		},
		add: function(card)
		{
			cards.unshift(card);
		},
		persist: function()
		{
			localStorage.setItem("auletta_cards", JSON.stringify(cards));
		}
	}
})



.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  }
})

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [{
    id: 0,
    name: 'Ben Sparrow',
    notes: 'Enjoys drawing things',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    notes: 'Odd obsession with everything',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlen',
    notes: 'Wears a sweet leather Jacket. I\'m a bit jealous',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    notes: 'I think he needs to buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    notes: 'Just the nicest guy',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];


  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
});