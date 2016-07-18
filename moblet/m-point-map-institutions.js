/* eslint no-undef: [0]*/
module.exports = {
  title: "mPointMapInstitutions",
  style: "m-point-map-institutions.scss",
  template: 'm-point-map-institutions.html',
  i18n: {
    pt: "lang/pt-BR.json",
    en: "lang/en-US.json"
  },
  link: function() {
    $mInjector.inject('https://www.gstatic.com/firebasejs/' +
      'live/3.0/firebase.js');
  },
  controller: function(
    $scope,
    $filter,
    $ionicScrollDelegate,
    $cordovaGeolocation,
    $timeout,
    $mMoblet,
    $mDataLoader,
    $mFrameSize
  ) {
    /* ********************************************************************** *
     *                     PRIVATE FUNCTIONS AND VARS
     * ********************************************************************** */
    var USER = 0;
    var PROBLEM = 1;

    var googleMap;
    var firebaseApp;
    var locations;
    var userLocation;
    var problemLocation;
    var markerLocation;
    var problemMarker;
    var markerZindex = 100;

    var PROBLEMS_DEF = {
      COMIDA: 'Comida',
      ROUPA: 'Roupa',
      COBERTOR: 'Cobertor',
      PET: 'Utensílios para Pets'
    };

    $scope.ICON_SVG_PATH = {
      "Comida": 'svgs/food-icon.svg',
      "Roupa": 'svgs/clothes-icon.svg',
      "Cobertor": 'svgs/blanket-icon.svg',
      "Utensílios para Pets": 'svgs/pets-icon.svg'
    };

    var getObjectLength = function(object) {
      if (object === undefined || object === null) {
        response = 0;
      } else {
        response = Object.keys(object).length;
      }
      return response;
    };

    var getNewLocation = function(oldLocations, newLocations) {
      for (var newKey in newLocations) {
        if (newLocations.hasOwnProperty(newKey)) {
          for (var oldKey in oldLocations) {
            if (oldLocations.hasOwnProperty(oldKey)) {
              if (!oldLocations.hasOwnProperty(newKey)) {
                return newLocations[newKey];
              }
            }
          }
        }
      }
    };
    /**
     * Create the problems $scope object
     */
    var resetProblems = function() {
      $scope.problems = {};
      $scope.problems[PROBLEMS_DEF.COMIDA] = false;
      $scope.problems[PROBLEMS_DEF.ROUPA] = false;
      $scope.problems[PROBLEMS_DEF.COBERTOR] = false;
      $scope.problems[PROBLEMS_DEF.PET] = false;
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
            var iconPath = '';
            var fontClass = 'info-problem-many-inst';

            if (key === PROBLEMS_DEF.PET) {
              iconPath = 'svgs/pets-icon.svg';
              fontClass = 'info-problem-pets';
            } else if (key === PROBLEMS_DEF.COBERTOR) {
              iconPath = 'svgs/blanket-icon.svg';
              fontClass = 'info-problem-blanket';
            } else if (key === PROBLEMS_DEF.ROUPA) {
              iconPath = 'svgs/clothes-icon.svg';
              fontClass = 'info-problem-clothes';
            } else if (key === PROBLEMS_DEF.COMIDA) {
              iconPath = 'svgs/food-icon.svg';
              fontClass = 'info-problem-food';
            }

            problems += '<h1 class="' + fontClass + '">' +
                        '<img src="' + iconPath + '"/>' + key + '</h1>';
          }
        }
      }
      var site = locations.site === undefined ?
       '' :
       '<p>' + location.site + '</p>';

      var infoWindowStr = '<div class="marker">' +
                          '<h1>' + location.name + '</h1>' +
                          '<p>' + location.address + '</p>' +
                          '<p>' + location.phone + '</p>' +
                          site +
                           problems + '</div>';

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

    var setMarkerIcon = function(problems) {
      var iconPath;

      if (problems === undefined || problems === null) {
        iconPath = 'svgs/many-inst-pointer.svg';
      } else if (problems.Cobertor && problems.Roupa ||
          problems.Cobertor && problems.Comida ||
          problems.Cobertor && problems['Utensílios para Pets'] ||
          problems.Roupa && problems.Comida ||
          problems.Roupa && problems['Utensílios para Pets'] ||
          problems.Comida && problems['Utensílios para Pets']) {
        iconPath = 'svgs/many-inst-pointer.svg';
      } else if (problems.Cobertor) {
        iconPath = 'svgs/blanket-pointer.svg';
      } else if (problems.Roupa) {
        iconPath = 'svgs/clothes-pointer.svg';
      } else if (problems.Comida) {
        iconPath = 'svgs/food-pointer.svg';
      } else if (problems['Utensílios para Pets']) {
        iconPath = 'svgs/pets-pointer.svg';
      } else {
        iconPath = 'svgs/many-inst-pointer.svg';
      }
      icon = new google.maps.MarkerImage(
        iconPath, null, null, null, new google.maps.Size(35, 44)
      );

      return icon;
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
        map: googleMap,
        icon: icon || setMarkerIcon(location.problems),
        draggable: drag || false,
        animation: anime || google.maps.Animation.DROP,
        zIndex: markerZindex++
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
                problemLocation = location;
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
        lat: -23.55038080370918,
        lng: -46.63395881652832
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
          browserSupportFlag = false;
          callback(defaultLocation);
        },
         {timeout: 5000, enableHighAccuracy: false}
       );
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
          loadFirebase(callback);
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
        var mapDiv = document.getElementById('m-point-map-' + $scope.moblet.id);

        // Set the map options
        var mapOptions = {
          mapTypeControl: false,
          streetViewControl: true,
          panControl: false,
          rotateControl: false,
          zoomControl: true,
          center: userLocation,
          zoom: 10,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // Create the googleMap object
        googleMap = new google.maps.Map(mapDiv, mapOptions);

        // Create the current user location marker
        var icon = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#46AEE2',
          fillOpacity: 0.5,
          strokeColor: '#4778BB',
          strokeWeight: 2,
          scale: 8
        };
        userLocationMarker = addMarker(
          userLocation, icon, false, false, USER
        );

        // Create the listener for click on map create the default pointer
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

          icon = new google.maps.MarkerImage(
            'svgs/default-pointer.svg',
            null, null, null, new google.maps.Size(35, 44)
          );

          problemMarker = addMarker(location, icon, true, 4, PROBLEM);

          // Create the listener to remove the mark
          problemMarker.addListener("click", function() {
            problemMarker.setMap(null);
            problemMarker = null;
            problemLocation = undefined;
          });
        });

        // Get locations from backend and creathe the Soccet Tunnel
        // with Firebase
        firebaseApp.database()
          .ref('institutions').on("value", function(snapshot) {
            var oldLocations = locations;
            locations = snapshot.val();
            var oldSize = getObjectLength(oldLocations);

            if (oldSize === 0) {
              addMarkers(locations);
            } else {
              var newLocation = getNewLocation(oldLocations, locations);
              addMarker(newLocation);
            }
          }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
          });

        // Remove the Moblets loader and create the view after the map
        // finishes loading
        googleMap.addListener('idle', function() {
          $timeout(function() {
            $scope.isLoading = false;
            var zoomButtons = document
                .getElementsByClassName('zoom-button');
            for (var z = 0; z < zoomButtons.length; z++) {
              zoomButtons[z].className += ' animate';
            }
            document
                .getElementById('m-point-map-' + $scope.moblet.id)
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
      resetProblems();
      loadFirebase(function(app) {
        firebaseApp = app;
        $scope.mapHeight = screenHeightLessButton();
        $scope.listHeight = 0;
        $scope.zoomMapButtonHeight = 0;
        $scope.zoomListButtonHeight = "44px";

        $scope.institution = {};

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
      if (userLocation || problemLocation) {
        $scope.institution.address = problemLocation === undefined ?
                                     userLocation.address :
                                     problemLocation.address;
      } else {
        $scope.institution.address = undefined;
      }
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

    $scope.addMyLocation = function(valid) {
      $timeout(function() {
        if (valid) {
          if (problemLocation === undefined) {
            markerLocation = angular.copy(userLocation);
          } else {
            markerLocation = angular.copy(problemLocation);
            problemLocation = undefined;
            problemMarker.setMap(null);
            problemMarker = null;
          }
          markerLocation.problems = angular.copy($scope.problems);
          markerLocation.name = $scope.institution.name;
          markerLocation.address = $scope.institution.address;
          markerLocation.phone = $scope.institution.phone;
          markerLocation.site = $scope.institution.site === undefined ?
                                '' :
                                $scope.institution.site;

          var instInput = document.getElementsByClassName('institution-input');
          for (i = 0; i < instInput.length; i++) {
            instInput[i].className = 'institution-input';
          }
          resetProblems();
          firebaseApp.database()
            .ref('institutions')
            .push(markerLocation);

          $scope.institution = { };
          $ionicScrollDelegate.scrollTop();
          $scope.zoomMap();
        } else {
          $ionicScrollDelegate.scrollTop();
        }
      }, 10);
    };

    init();
  }
};
