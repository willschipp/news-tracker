var router = require('express').Router();

var FeedParser = require('feedparser');
var request = require('request');
var pos = require('pos');
var tagger = new pos.Tagger();
var country = require('countryjs');
var lookup = require('country-data').lookup;

var method = routes.prototype;

function routes(io) {


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
              var countryInfo = country.info(result[0].alpha2);
              var data = {};
              data.title = item.title;
              data.description = item.description;
              data.guid = item.guid;
              data.link = item.link;
              data.summary = item.summary;
              data.pubDate = item.pubDate;
              //create a marker
              var marker = {};
              marker[item.guid] = {
                  "lat":countryInfo.latlng[0],
                  "lng":countryInfo.latlng[1],
                  "draggable":false,
                  "icon":{
                    "iconUrl":"/img/marker.png",
                    "iconAnchor":[10,31]
                  },
                  "data":{
                    "heading":taggedWord[0],
                    "content":data
                  }
                }
              // console.log(countryInfo.latlng);


              io.emit('news',marker);
            }
          }//end if
        }//end for

      };

    });

    return res.sendStatus(201);
  });

  return router;
}

method.getRoutes  = function() {
  return this;
}

module.exports = routes;
