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


.factory('Decks', function() {
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