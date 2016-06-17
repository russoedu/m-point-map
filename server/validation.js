// node com a validação
// var uLang = require('uLang');
// var http = require('http');

module.exports = {
  /**
   * Validate a given address as a valid Google Maps address
   * @param {Object}   location Object with one of the "locations" array data.
   * @param {Function} callback The callback that will be called when the
   * validation finishes. The callback parameters are a Boolean, that responds
   * if it's valid and an Object with the response data
   */
  locations: function(location, callback) {
    var valid = false;
    var response = {};
    // "Rua James Watt, 84 - são paulo - sp"
    getGoogleMapsData(location.address, function(mapData) {
      // console.log(mapData);
      if (mapData.status === 'OK') {
        valid = true;
        response = {
          data: {
            latitude: mapData.results[0].geometry.location.lat,
            longitude: mapData.results[0].geometry.location.lng
          }
        };
      } else {
        valid = false;
        response = {
          errors: {
            address: mapData
          }
        };
      }
      callback(valid, response);
    });
  }
};

/**
 * Get Google Maps data for a given address
 * @param  {String}   address  The address
 * @param  {Function} callback callback function that will receive the Google
 * Maps response as an Object
 */
function getGoogleMapsData(address, callback) {
  var http = require('http');
  var response = '';
  var host = 'http://maps.googleapis.com/maps/api/geocode/json' +
  '?sensor=false&address=' +
  encodeURIComponent(address);

  http.get(host, function(res) {
    res
      .on("data", function(chunk) {
        response += chunk;
      })
      .on('end', function() {
        callback(JSON.parse(response));
      })
      .on('error', function(e) {
        console.log(`Got error: ${e.message}`);
      });
  });
}
