var ConnectionsModel = require("../models/ConnectionsModel"),
    JSONLDView = require('../views/JSONLDView');

module.exports = function (request, response, next) {
  //1. Check whether this page is good: if it isn't, do a redirect
  //check if a datetime is set, otherwise, redirect towards the correct pageId of now
  if (!request.query.departureTime) {
    if (request.query.onlyWheelchairAccessibleTrips) {
      response.redirect(302, request.locals.config.baseUri + '/connections/?departureTime=' + encodeURIComponent(request.locals.page.getCorrectPageId(new Date)) + '&onlyWheelchairAccessibleTrips=' + request.query.onlyWheelchairAccessibleTrips);
    } else {
      response.redirect(302, request.locals.config.baseUri + '/connections/?departureTime=' + encodeURIComponent(request.locals.page.getCorrectPageId(new Date)));
    }
  } else if (request.locals.page.getCorrectPageId(decodeURIComponent(request.query.departureTime)) !== request.query.departureTime){
    if (request.query.onlyWheelchairAccessibleTrips) {
      response.redirect(302, request.locals.config.baseUri + '/connections/?departureTime=' + encodeURIComponent(request.locals.page.getCorrectPageId(request.query.departureTime)) + '&onlyWheelchairAccessibleTrips=' + request.query.onlyWheelchairAccessibleTrips);
    } else {
      response.redirect(302, request.locals.config.baseUri + '/connections/?departureTime=' + encodeURIComponent(request.locals.page.getCorrectPageId(request.query.departureTime)));
    }
  } else {
    //2. If it is a good page, then we can start streaming out the response and a HTTP 200 OK should be returned.
    // → We will now have to create a model for the data we want to retrieve from the db
    var connections = new ConnectionsModel(request.db);
    var view = new JSONLDView({
      "@context" : request.locals.config.baseUri + "/connections/context.json",
      "@id" : request.locals.page.getCurrentPage(),
      "@type" : "PagedCollection",
      "nextPage" : request.locals.page.getNextPage(),
      "previousPage" : request.locals.page.getPreviousPage(),
      "search" : {
        "@type" : "IriTemplate",
        "template" : request.locals.config.baseUri + "/connections/{?departureTime}{&onlyWheelchairAccessibleTrips}",
        "variableRepresentation" : "BasicRepresentation",
        "mapping" : [{
          "@type" : "IriTemplateMapping",
          "variable" : "departureTime",
          "required" : true,
          "property" : "http://semweb.mmlab.be/ns/linkedconnections#departureTimeQuery"
        },{
          "@type" : "IriTemplateMapping",
          "variable" : "onlyWheelchairAccessibleTrips",
          "required" : false,
          "property" : "http://semweb.mmlab.be/ns/linkedconnections#onlyWheelchairAccessibleTrips"
        }]
      }
    });
    
    //3. Stream output when the graph is being generated
    var onlyWheelchairAccessibleTrips = false;
    if (request.query.onlyWheelchairAccessibleTrips) {
      onlyWheelchairAccessibleTrips = (request.query.onlyWheelchairAccessibleTrips.toLowerCase() == "true" )
    }
    connections.getPage(request.locals.page, onlyWheelchairAccessibleTrips, function (error, connectionsStream) {
      if (error) {
        next(error);
      } else {
        //Create output
        response.status(200);
        response.type("application/ld+json");
        connectionsStream
          .pipe(view)
          .pipe(response)
          .on('end', next);
      }
    });
  }
};
