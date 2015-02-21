angular.module('auletta.services', [])

.factory('Decks', function() {
	// Some fake testing data
	var decks = [
	             {
	            	 id: 0,
	            	 deckTitle: 'Ben Sparrow',
	            	 deckDescription: 'You on your way?',
	            	 deckThumb: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png',
	            	 deckCards: [1,2,3,4,5,6,7,8,9]
	             }, 
	             {
				    id: 1,
				    deckTitle: 'Max Lynx',
				    deckDescription: 'Hey, it\'s me',
				    deckThumb: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460',
				    deckCards: [1,2,3,4,5,6,7,8,9]
				 }, 
				 {
				    id: 2,
				    deckTitle: 'Andrew Jostlin',
				    deckDescription: 'Did you get the ice cream?',
				    deckThumb: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg',
				    deckCards: [1,2,3,4,5,6,7,8,9]
				 }, 
				 {
				    id: 3,
				    deckTitle: 'Adam Bradleyson',
				    deckDescription: 'I should buy a boat',
				    deckThumb: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg',
				    deckCards: [1,2,3,4,5,6,7,8,9]
				  }, 
				  {
				    id: 4,
				    deckTitle: 'Perry Governor',
				    deckDescription: 'Look at my mukluks!',
				    deckThumb: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg',
				    deckCards: [1,2,3,4,5,6,7,8,9]
				  }
				 ];

	return {
		all: function() {
			return decks;
		},
		remove: function(deck) {
			decks.splice(decks.indexOf(deck), 1);
		},
		get: function(deckId) {
			for (var i = 0; i < decks.length; i++) {
				if (decks[i].id === parseInt(deckId)) {
					return decks[i];
				}
			}
			return null;
		},
		add: function(deck)
		{
			decks.push(deck);
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
