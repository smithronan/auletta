// Use Parse.Cloud.define to define as many cloud functions as you want.
 
Parse.Cloud.define("getBrowsableDecks", function(request, response){
 
  var query = new Parse.Query("Deck");  
   
  var _type = request.params.type;
  if(!_type)
  {
    _type = 0;
  }
   
  if(_type > 0)
  {
    query.equalTo("DeckTypeId", _type);
  }
   
  query.find({
    success: function(results) 
    {      
      response.success(results);
    },
    error: function() 
    {
      response.error("An error occurred while retrieving Decks.");
    }
  });
       
});