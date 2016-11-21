var router = require('express').Router();

var FeedParser = require('feedparser');
var request = require('request');
var pos = require('pos');
var tagger = new pos.Tagger();
var country = require('countryjs');
var lookup = require('country-data').lookup;

//http://www.aljazeera.com/xml/rss/all.xml

module.exports = function(io) {



  router.get('/',function(req,res) {
    //get a news feed
    var feed = request("http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/world/rss.xml");
    var feedparser = new FeedParser();
    feed.on('error',function(err) {
      console.log(err);
    });

    // return res.sendStatus(500);

    feed.on('response',function(response) {
      var stream = this;
      stream.pipe(feedparser);
    });

    feedparser.on('error',function(err) {
      console.log(err);
      // return res.sendStatus(500);
    });

    feedparser.on('readable',function() {
      var stream = this;
      var meta = this.meta;
      var item;

      while (item = stream.read()) {
        //parse for places
        // console.log(item);
        var words = new pos.Lexer().lex(item.description);
        var taggedWords = tagger.tag(words);
        for (i in taggedWords) {
          var taggedWord = taggedWords[i];
          if (taggedWord[1] == 'NNP') {
            //name --> get lat/long for the place
            var result = lookup.countries({name:taggedWord[0]});
            if (result.length > 0) {
              //create a marker
              var countryInfo = country.info(result[0].alpha2);
              // console.log(countryInfo.latlng);

            }
          }//end if
        }//end for

      };

    });

    return res.sendStatus(201);

  });


}
