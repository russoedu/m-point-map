/* eslint no-undef: [0]*/
module.exports = {
  title: "mPointMap",
  style: "m-point-map.scss",
  template: 'm-point-map.html',
  i18n: {
    pt: "lang/pt-BR.json",
    en: "lang/en-US.json"
  },
  link: function() {
    // $uInjector.inject('http://maps.google.com/maps/api/js' +
    //   '?key=AIzaSyDNzstSiq9llIK8b49En0dT-yFA5YpManU&amp;sensor=true');
    $uInjector.inject('https://www.gstatic.com/firebasejs/' +
      'live/3.0/firebase.js');
  },
  controller: function(
    $scope,
    $mMoblet,
    $mDataLoader,
    $filter,
    $ionicScrollDelegate,
    $uAlert,
    $timeout,
    $mFrameSize
  ) {
    /* ********************************************************************** *
     *                     PRIVATE FUNCTIONS AND VARS
     * ********************************************************************** */
    var USER = 0;
    var PROBLEM = 1;

    var googleMap;
    var firebaseApp;
    var userLocation;
    var problemLocation;
    var markerLocation;
    var problemMarker;

    /**
     * Create the problems $scope object
     */
    var setProblems = function() {
      $scope.problems = {
        cobertor: false,
        roupa: false,
        comida: false
      };
    };

    /**
     * Create the info window with the location details
     * @param  {object} location   The location stored in the DB
     * @param {infoWindowCallback}   callback The info window that will be opened on click
     */
    var createInfoWindow = function(location, callback) {
      /**
       * infoWindowCallback
       * @param {infoWindow object} infoWindow The created info window
       */
      var problems = '';
      for (var key in location.problems) {
        if (location.problems.hasOwnProperty(key)) {
          if (location.problems[key]) {
            problems += '<h1 class="info-window-problem ' + key + '">' +
            key + '</h1>';
          }
        }
      }
      var infoWindowStr = '<div class="marker"><p>' + location.address +
      '</p>' + problems + '</div>';

      infoWindow = new google.maps.InfoWindow({
        content: infoWindowStr,
        maxWidth: window.innerWidth - 20
      });

      callback(infoWindow);
    };

    /**
     * Get a location with it's address from Maps API
     * @param  {object}   markerPosition      marker.getPosition() object
     * @param  {locationCallback} callback Return the location with the address
     */
    var getLocationWithAddress = function(markerPosition, callback) {
      /**
       * @callback locationCallback
       * @param {object} location Location with lat, lng and address
       */
      geocoder = new google.maps.Geocoder();
      geocoder.geocode({latLng: markerPosition}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          var location = {
            lat: markerPosition.lat(),
            lng: markerPosition.lng(),
            address: results[0].formatted_address
          };
          if (typeof callback === "function") {
            callback(location);
          }
            // $("#mapSearchInput").val(results[0].formatted_address);
            // $("#mapErrorMsg").hide(100);
        } else {
          console.log(status);
            // $("#mapErrorMsg").html('FOK.' + status).show(100);
        }
      });
    };

    /**
     * Add a new marker to the map
     * @param  {object} location     Location with lat, lng, address and
     * problems array
     * @param  {object} icon         Google Maps icon object
     * @param  {boolean} drag         Set if the marker is draggable
     * @param  {boolean} anime        Set if the icon show animate
     * @param  {integer} locationType The location type can be USER or PROBLEM
     * @return {GoogleMapsObject}    The created marker
     */
    var addMarker = function(location, icon, drag, anime, locationType) {
      var markerOption = {
        position: location,
        icon: icon || null,
        draggable: drag || false,
        map: googleMap,
        animation: google.maps.Animation.DROP
      };
      if (anime === false) {
        markerOption.animation = null;
      }

      var marker = new google.maps.Marker(markerOption);

      if (locationType === USER) {
        getLocationWithAddress(marker.getPosition(), function(location) {
          userLocation = location;
        });
      } else if (locationType === PROBLEM) {
        getLocationWithAddress(marker.getPosition(), function(location) {
          problemLocation = location;
        });
      // Only add the InfoWindow if it's a problem already added
      } else {
        marker.addListener('click', function() {
          createInfoWindow(location, function(infoWindow) {
            infoWindow.open(googleMap, marker);
          });
        });
      }
      if (drag) {
        google.maps.event.addListener(
          marker,
          'dragend',
          function() {
            getLocationWithAddress(
              marker.getPosition(),
              function(location) {
                markerLocation = location;
              }
            );
          }
        );
      }

      return marker;
    };

    /**
     * Add the markers to the map
     * @param  {array} locations Locations array with location object with
     * lat, lng, address and problems array
     */
    var addMarkers = function(locations) {
      for (var key in locations) {
        if (locations.hasOwnProperty(key)) {
          /*
           * TODO: set icon according to the problem
           */
          addMarker(locations[key]);
        }
      }
    };

    /**
     * Find the user current location
     * @param  {userCurrentLocationCallback} callback The current user location
     */
    var findUserLocation = function(callback) {
      /**
       * @callback userCurrentLocationCallback
       * @param  {object} userLocation The current user location with lat
       * and lng
       */
      // São Paulo center
      var defaultLocation = {
        lat: -23.6821604,
        lng: -46.8754891
      };
      if (navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function(position) {
          var userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          callback(userLocation);
        }, function() {
          callback(defaultLocation);
        });
      } else {
        browserSupportFlag = false;
        callback(defaultLocation);
      }
    };

    /**
     * Uses "mFrameSize" to get the size of the screen less the button
     * @return {string}        The height of the rest of the screen
     */
    var screenHeightLessButton = function() {
      var height = parseInt($mFrameSize.height(), 10);
      return (height - 44) + "px";
    };

    /**
     * Load Firebase app to the window
     * @param  {firebaseAppCallback} callback Return the Firebase app
     */
    var loadFirebase = function(callback) {
      /**
       * @callback  firebaseAppCallback
       * @param {firebase app}           The Firebase app in the window object
       */
      $timeout(function() {
        // Wait until 'firebase api' has been injected
        if (typeof firebase === "undefined") {
          loadFirebase();
        } else if (isDefined(window.firebaseApp)) {
          callback(window.firebaseApp);
        } else {
          var config = {
            apiKey: "AIzaSyCIuFP_4PlDGJV9iE_XZN5JiX37ZaZTSeE",
            authDomain: "sem-frio.firebaseapp.com",
            databaseURL: "https://sem-frio.firebaseio.com",
            storageBucket: "sem-frio.appspot.com"
          };
          window.firebaseApp = firebase.initializeApp(config);
          callback(window.firebaseApp);
        }
      }, 500);
    };

    /**
     * Load the map and add it to m-point-map-1 div
     */
    var loadMap = function() {
      findUserLocation(function(location) {
        userLocation = location;

        var mapDiv = document.getElementById('m-point-map-1');

          // Set the map options
        var mapOptions = {
          mapTypeControl: false,
          streetViewControl: true,
          panControl: false,
          rotateControl: false,
          zoomControl: true,
          center: userLocation,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        googleMap = new google.maps.Map(mapDiv, mapOptions);

        var icon = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#46AEE2',
          fillOpacity: 0.9,
          strokeColor: '#4778BB',
          strokeWeight: 2,
          scale: 8
        };

        userLocationMarker = addMarker(
          userLocation, icon, false, false, USER
        );

        // added var
        problemMarker = null;

        googleMap.addListener('click', function(pos) {
          var location = {
            lat: pos.latLng.lat(),
            lng: pos.latLng.lng()
          };

          // added
          if (problemMarker !== null) {
            problemMarker.setMap(null);
          }

          problemMarker = addMarker(location, null, true, true, PROBLEM);

          // added listener
          problemMarker.addListener("dblclick", function() {
            problemMarker.setMap(null);
            problemMarker = null;
            problemLocation = undefined;
          });
          // location, icon, draggable, animation, myLocation
        });

        firebaseApp.database()
          .ref('locations').on("value", function(snapshot) {
            var locations = snapshot.val();

            addMarkers(locations);
          }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
          });

          // Remove the Moblets loader after the map finish loading
        googleMap.addListener('idle', function() {
          $timeout(function() {
            $scope.isLoading = false;
            var zoomButtons = document
                .getElementsByClassName('zoom-button');
            for (var z = 0; z < zoomButtons.length; z++) {
              zoomButtons[z].className += ' animate';
            }
            document
                .getElementById('m-point-map-1')
                .className = 'animate';
            document
                .getElementById('m-point-map-list')
                .className += ' animate';
          }, 1);
        });
      });
    };

    var init = function() {
      $scope.isLoading = true;
      setProblems();
      loadFirebase(function(app) {
        firebaseApp = app;
        $scope.mapHeight = screenHeightLessButton();
        $scope.listHeight = 0;
        $scope.zoomMapButtonHeight = 0;
        $scope.zoomListButtonHeight = "44px";
        $ionicScrollDelegate.$getByHandle('listMapScroll').resize();
        loadMap();
      });
    };

    /*
     * Focus and expand the list of locations
     */
    $scope.zoomList = function() {
      $scope.mapHeight = 0;
      $scope.listHeight = screenHeightLessButton();
      $scope.zoomMapButtonHeight = "44px";
      $scope.zoomListButtonHeight = 0;
      $ionicScrollDelegate.$getByHandle('listMapScroll').resize();
    };

    /**
     * Focus and expand the map
     */
    $scope.zoomMap = function() {
      $scope.mapHeight = screenHeightLessButton();
      $scope.listHeight = 0;
      $scope.zoomMapButtonHeight = 0;
      $scope.zoomListButtonHeight = "44px";
      $ionicScrollDelegate.$getByHandle('listMapScroll').resize();
    };

    $scope.addMyLocation = function() {
      if (problemLocation === undefined) {
        markerLocation = angular.copy(userLocation);
      } else {
        markerLocation = angular.copy(problemLocation);
        problemLocation = undefined;
        problemMarker.setMap(null);
        problemMarker = null;
      }
      markerLocation.problems = angular.copy($scope.problems);
      setProblems();
      firebaseApp.database()
        .ref('locations')
        .push(markerLocation);

      $timeout(function() {
        $scope.zoomMap();
      }, 10);
    };

    init();
  }
};
