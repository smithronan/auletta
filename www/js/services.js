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


.factory('Decks', function($rootScope, $cordovaFileTransfer) {
	
	var ls_decks = JSON.parse(localStorage.getItem("auletta_decks"));
        
	var decks = (ls_decks !== null) ? ls_decks : [];	
	
		
	
	deckFactory = {};

	deckFactory.all = function() {
		return decks;
	}
	
	deckFactory.reorder = function(_deckId, _from, _to)
	{
		var deckToMove = decks[_from];
		decks.splice(_from, 1);
		decks.splice(_to, 0, deckToMove);
		return decks;
	}
	
	deckFactory.remove = function(_deckId) {
		console.log("Remove Deck: " + _deckId);
		
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
		
		deckFactory.persist();
		
		return decks
	}
	
	deckFactory.get = function(deckId) {
		for (var i = 0; i < decks.length; i++) {
			if (decks[i].deckId === deckId) {
				return decks[i];
			}
		}
		return null;
	}
	
	deckFactory.add = function(deck)
	{
		decks.unshift(deck);
	}
	
	deckFactory.persist = function()
	{
		localStorage.setItem("auletta_decks", JSON.stringify(decks));
	}
	
	deckFactory.allAsJson = function()
	{
		return JSON.stringify(decks);
	}
	
	deckFactory.restoreSingleFromCloud = function(_deckId)
	{
		var _userId = Parse.User.current().id;
		
		var UserDeckQuery = Parse.Object.extend("UserDeckList");
		var query = new Parse.Query(UserDeckQuery);
		query.equalTo("userId", _userId);
		query.equalTo("deckId", _deckId);
		
		query.find({
			  success: function(results) 
			  {
				  if(results.length > 0)
				  {
					  $rootScope.decksDownloading = results.length;
					  
					  for(i=0; i<results.length; i++)
					  {
						  if(deckFactory.get(results[i].attributes.deckId))
						  {
							  deckFactory.remove(results[i].attributes.deckId);
							  deckFactory.persist();
						  }
						  
						  var _newDeck = 
							{
							 	deckId: results[i].attributes.deckId,
								deckTitle: results[i].attributes.deckTitle,
							 	deckDescription: results[i].attributes.deckDescription,
							 	deckThumb: results[i].attributes.deckThumb,
							 	deckCards: []
							};
						  
						//Retrieve the card headers for this deck
						  var query = new Parse.Query("UserDeckCard");
						    query.equalTo("deckId", results[i].attributes.deckId);
						    query.equalTo("userId", _userId);
						    query.ascending("cardOrder");
						    
						    query.find({
								  success: function(results) 
								  {
									  for(i=0; i<results.length; i++)
									  {
										  var _newCard =
							    			{
							    				cardId: results[i].attributes.cardId,
							    				cardImage: results[i].attributes.cardImage,
												//download the card from parse at this point!
							    				cardText: results[i].attributes.cardText,
							    				cardAudio: results[i].attributes.cardAudio
							    			}
							    														
							    			_newDeck.deckCards.push(_newCard);
									  }
									  
									  deckFactory.add(_newDeck);
									  deckFactory.persist();
								  },
								  error: function(error)
								  {}
						    });
						 					  
						  $rootScope.decksDownloading--; 
					  }				  
				  }
				  else
				  {
					  $rootScope.decksDownloading = 0;
					  $rootScope.cardsDownloading = 0;
				  }
			  },
			  error: function(error) 
			  {
				    alert("Error: " + error.code + " " + error.message);
				    $rootScope.decksDownloading = 0;
					$rootScope.cardsDownloading = 0;
			  }
		});
		
	}
	
	
	deckFactory.restoreFromCloud = function()
	{
		var _userId = Parse.User.current().id;
		
		var UserDeckQuery = Parse.Object.extend("UserDeckList");
		var query = new Parse.Query(UserDeckQuery);
		query.equalTo("userId", _userId);
		
		query.find({
			  success: function(results) 
			  {
				  if(results.length > 0)
				  {
					  $rootScope.decksDownloading = results.length;
					  
					  for(i=0; i<results.length; i++)
					  {
						  deckFactory.restoreSingleFromCloud(results[i].attributes.deckId);
					  }
				  }
				  else
				  {
					  $rootScope.decksDownloading = 0;
					  $rootScope.cardsDownloading = 0;
				  }
			  },
			  error: function(error) 
			  {
				    alert("Error: " + error.code + " " + error.message);
				    $rootScope.decksDownloading = 0;
					$rootScope.cardsDownloading = 0;
			  }
		});
		
	}
	
	
	
	deckFactory.cloudDelete = function(_parseObjectId, _deckId)
	{
		var _userId = Parse.User.current().id;
		
		var deckToDelete = Parse.Object.extend("UserDeckList");
		var query = new Parse.Query(deckToDelete);
		query.get(_parseObjectId, {
		  success: function(theDeck) {			    
		    console.log(theDeck);
			theDeck.destroy({});
		    
		    var delQuery = new Parse.Query("UserDeckCard");
			delQuery.equalTo("deckId", _deckId);
			delQuery.equalTo("userId", _userId);				

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
		  error: function(object, error) {
		    
		  }
		});
		
		
		
		
	}
	
	deckFactory.markCardsReplaced = function(_deckId)
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
	}
	
	deckFactory.saveCardToCloud = function(_card, _order, _deckId)
	{
		var _userId = Parse.User.current().id;
		
		var UserDeckCard = Parse.Object.extend("UserDeckCard");
		var userDeckCard = new UserDeckCard();
		
		var _cardChecksumString = _card.cardId + _card.cardImage + _card.cardText + _card.cardAudio + _order;
    	_cardLocalChecksum = AulettaGlobal.helpers.crc32(_cardChecksumString);
		
    	//Save the card image file into the parse cloud.....hopefully!
    	window.resolveLocalFileSystemURL(
					"file://" + _card.cardImage, 
					function(oFile) 
					{
						oFile.file(
							function(readyFile) 
							{
								var reader= new FileReader();
								reader.onloadend= function(evt) 
								{	    					         
									var cardImageFile = new Parse.File(_card.cardId + ".png", { base64: evt.target.result });
									cardImageFile.save().then(
										function(_result) 
										{
											for (var key in _result) 
											{
											  if (_result.hasOwnProperty(key)) 
											  {
												console.log(key + " -> " + _result[key]);
											  }
											}
											
											userDeckCard.save(
													{
														userId: _userId,
														cardId: _card.cardId,
														cardImage: _result._url,									
														cardText: _card.cardText,
														cardAudio: _card.cardAudio,
														cardReplaced: false,
														cardOrder: _order,
														deckId: _deckId,
														cardCrc32: _cardLocalChecksum,
														cardImageParseFile: cardImageFile
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
										function(error) 
										{
											// The file either could not be read, or could not be saved to Parse.
										}
									);
								};
								reader.readAsDataURL(readyFile); 
							}		
						);
					}, 
					function(err)
					{
						console.log('### ERR: filesystem.directoryUp() - ' + (JSON.stringify(err)));
					}
		);
    	
    	
		
	}
	
	deckFactory.saveToCloud = function(_deck)
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
	
	return deckFactory;
})


.factory('Cards', function() {
	var ls_cards = JSON.parse(localStorage.getItem("auletta_cards"));
	
	var cards = (ls_cards !== null) ? ls_cards : [];	

	var cardFactory = {}
	
	cardFactory.all = function()
	{
		return cards;
	}
	
	cardFactory.get = function(cardId) {
		for (var i = 0; i < cards.length; i++) {
			if (cards[i].cardId === cardId) {
				return cards[i];
			}
		}
		return null;
	}
	
	cardFactory.add = function(card)
	{
		cards.unshift(card);
	}
	
	cardFactory.persist = function()
	{
		localStorage.setItem("auletta_cards", JSON.stringify(cards));
	}
	
	return cardFactory;
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
