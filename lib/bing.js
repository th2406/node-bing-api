
/*********************************************************
 *  Simple Node.js module for using the Bing Search API  *
 *********************************************************/

// Require dependencies
var request = require('request'),
    url = require('url'),
    _ = require('underscore'),
    qs = require('querystring');

/**
 * @param {Object} options  Options to all Bing calls, allows overriding of
 *        rootUri, accKey (Bing API key), userAgent, reqTimeout
 * @returns {Bing}
 * @constructor
 */
var Bing = function( options ) {

  if( !(this instanceof Bing) ) return new Bing( options );

  var defaults = {

    //Bing Search API URI
    rootUri: "https://api.datamarket.azure.com/Bing/Search/",

    //Account Key
    accKey: null,

    //Bing UserAgent
    userAgent: 'Bing Search Client for Node.js',

    //Request Timeout
    reqTimeout: 5000,

    // Number of results (limited to 50 by API)
    top: 50,

    // Number of skipped results (pagination)
    skip: 0

  };

  //merge options passed in with defaults
  this.options = _.extend(defaults, options);

  this.searchVertical = function(query, vertical, callback, options) {

    if(typeof callback != 'function') {
      throw "Error: Callback function required!";
    }

    var opts = this.options;

    if (options !== null) {
      opts = _.extend(this.options, options);
    }

    var reqUri = opts.rootUri
                   + vertical
                   + "?$format=json&"
                   + qs.stringify({ "Query": "'" + query + "'" })
                   + "&$top=" + opts.top
                   + "&$skip=" + opts.skip
                   + (opts.market ? "&Market=%27" + opts.market + "%27" : '')
                   + (opts.imagefilters 
                       ? '&' + qs.stringify({ "ImageFilters": "'" + opts.imagefilters + "'" })
                       : '');

    request({
      uri: reqUri,
      method: opts.method || "GET",
      headers: {
        "User-Agent": opts.userAgent
      },
      auth: {
        user: opts.accKey,
        pass: opts.accKey
      },
      timeout: opts.reqTimeout

    }, function(err, res, body){

      if(res && res.statusCode !== 200){
        err = new Error(body);
      }else{

        // Parse body, if body
        body = typeof body === 'string'
                 ? JSON.parse(body)
                 : body;
      }

      callback(err, res, body);
    });
  };

};


/**
 * @callback requestCallback
 * @param {String} error     Error evaluates to true when an error has occurred.
 * @param {Object} response  Response object from the Bing call.
 * @param {Object} body      JSON of the response.
 */


/**
 * Performs a Bing search in the Web vertical.
 *
 * @param {String} query              Query term to search for.
 *
 * @param {requestCallback} callback  Callback called with (potentially
 *                                    json-parsed) response.
 *
 * @param {Object} options            Options to command, allows overriding
 *                                    of rootUri, accKey (Bing API key),
 *                                    userAgent, reqTimeout, top, skip
 * @function
 */
Bing.prototype.search = function(query, callback, options) {
    this.searchVertical(query, "Web", callback, options);
};


/**
 * Performs a Bing search in the Images vertical.
 *
 * @param {String} query              Query term to search for.
 *
 * @param {requestCallback} callback  Callback called with (potentially
 *                                    json-parsed) response.
 *
 * @param {Object} options            Options to command, allows overriding of
 *                                    rootUri, accKey (Bing API key),
 *                                    userAgent, reqTimeout, top, skip
 * @function
 */
Bing.prototype.images = function(query, callback, options) {
    this.searchVertical(query, "Image", callback, options);
};


module.exports = Bing;

