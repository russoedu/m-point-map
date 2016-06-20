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
    $mFrameSize,
    $rootScope
  ) {
    /**
     * Find the center of the map based on the locations.
     * Get the 4 most extree points and fix it's center
     */
    // var findCenter = function() {
    //   var locations = $scope.mapData.locations;
    //   var longitudeMin = Number(locations[0].longitude);
    //   var latitudeMin = Number(locations[0].latitude);
    //   var longitudeMax = Number(locations[0].longitude);
    //   var latitudeMax = Number(locations[0].latitude);
    //
    //   for (var i = 0; i < locations.length; i++) {
    //     if (Number(locations[i].longitude) < longitudeMin) {
    //       longitudeMin = Number(locations[i].longitude);
    //     }
    //     if (Number(locations[i].longitude) > longitudeMax) {
    //       longitudeMax = Number(locations[i].longitude);
    //     }
    //     if (Number(locations[i].latitude) < latitudeMin) {
    //       latitudeMin = Number(locations[i].latitude);
    //     }
    //     if (Number(locations[i].latitude) > latitudeMax) {
    //       latitudeMax = Number(locations[i].latitude);
    //     }
    //   }
    //   $scope.longitudeMin = longitudeMin;
    //   $scope.latitudeMin = latitudeMin;
    //   $scope.longitudeMax = longitudeMax;
    //   $scope.latitudeMax = latitudeMax;
    //   $scope.mapData.centerLongitude = (longitudeMax + longitudeMin) / 2;
    //   $scope.mapData.centerLatitude = (latitudeMax + latitudeMin) / 2;
    // };

    var markerListener = function(infoWindow, marker, location) {
      return function() {
        infoWindow.setContent(
          '<div class="marker">' +
          '<h1>' + location.title + '</h1>' +
          '<p>' + location.address + '</p>' +
          '</div>');
        infoWindow.open($scope.googleMap, marker);
      };
    };

    /**
     * Add the markers to the map
     * @param  {Array} locations Array of objects with each location detail
     * @param  {Object} icon Icon object
     * @param  {boolean} draggable If the marker is draggable
     * @param  {boolean} animation If the marker is animated
     */
    var addMarkers = function(locations, icon, draggable, animation) {
      // Add the pins
      for (var i = 0; i < locations.length; i++) {
        var markerOption = {
          position: locations[i],
          icon: icon || null,
          draggable: draggable || false,
          map: $scope.googleMap,
          animation: google.maps.Animation.DROP
        };
        if (animation === false) {
          markerOption.animation = null;
        }

        var marker = new google.maps.Marker(markerOption);

        // Add the pins content
        var infoWindow = new google.maps.InfoWindow();
        google.maps.event.addListener(
          marker,
          'click',
          markerListener(infoWindow, marker, locations[i])
        );
      }
    };

    /**
     * Find the user current location
     * @param  {userCurrentLocationCallback} callback The current user location
     */
    var findUserLocation = function(callback) {
      /**
       * @callback userCurrentLocationCallback
       * @param  {Geoposition} userLocation The current user Geopostion
       */
      if (navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function(position) {
          var userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          callback(userLocation);
        }, function() {
          handleNoGeolocation(browserSupportFlag);
          callback(null);
        });
      } else {
        browserSupportFlag = false;
        handleNoGeolocation(browserSupportFlag);
        callback(null);
      }
    };

    /**
     * Uses "u-make-frame-min-size" to split the screen in percentage
     * @param  {Integer} factor The percentage of the screen the element
     * should use
     * @return {String}        The height in pixels with "px" in the end
     */
    var screenHeightLessButton = function() {
      var height = parseInt($mFrameSize.height(), 10);
      return (height - 44) + "px";
    };

    var loadFirebase = function(callback) {
      $timeout(function() {
        /*
         * TODO don't create Firebase app twice…
         */
        // Wait until 'firebase api' has been injected
        if (typeof firebase === "undefined") {
          loadFirebase();
        } else {
          var config = {
            apiKey: "AIzaSyCIuFP_4PlDGJV9iE_XZN5JiX37ZaZTSeE",
            authDomain: "sem-frio.firebaseapp.com",
            databaseURL: "https://sem-frio.firebaseio.com",
            storageBucket: "sem-frio.appspot.com"
          };
          var firebaseApp = firebase.initializeApp(config);
          callback(firebaseApp);
        }
      }, 500);
    };

    var loadMap = function() {
      findUserLocation(function(userLocation) {
        $scope.googleMap = google;
            // var mapData = $scope.mapData;
          // var locations = mapData.locations;
        var mapDiv = document.getElementById('m-point-map-1');

          // Set the map options
        var mapOptions = {
          mapTypeControl: false,
          streetViewControl: true,
          panControl: false,
          rotateControl: false,
          zoomControl: false,
          center: userLocation,
          zoom: 10,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        $scope.googleMap = new google.maps.Map(mapDiv, mapOptions);

        var icon = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#46AEE2',
          fillOpacity: 0.9,
          strokeColor: '#4778BB',
          strokeWeight: 2,
          scale: 8
        };

        addMarkers([userLocation], icon, true, false);

        $scope.firebaseApp.database()
          .ref('locations').on("value", function(snapshot) {
            var locationsArray = [];
            var locationsFromFirebase = snapshot.val();
            for (var key in locationsFromFirebase) {
              if (locationsFromFirebase.hasOwnProperty(key)) {
                locationsArray.push({
                  lat: locationsFromFirebase[key].lat,
                  lng: locationsFromFirebase[key].lng,
                  title: locationsFromFirebase[key].title,
                  description: locationsFromFirebase[key].description
                });
              }
            }
            addMarkers(locationsArray);
          }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
          });

          // Auto set the map zoom using the extreme points
          // $scope.googleMap.fitBounds(new google.maps.LatLngBounds(
          //   new google.maps.LatLng($scope.latitudeMin, $scope.longitudeMin),
          //   new google.maps.LatLng($scope.latitudeMax, $scope.longitudeMax)
          // ));

          // Remove the Moblets loader after the map finish loading
        $scope.googleMap.addListener('idle', function() {
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
        // }
      // }, 100);
    };

    var init = function() {
      $scope.isLoading = true;
      loadFirebase(function(firebaseApp) {
        $scope.firebaseApp = firebaseApp;
        $scope.isLoading = true;
      // $scope.mapData = {}; // ????? get data from Firebase
        $scope.mapHeight = screenHeightLessButton();
        $scope.listHeight = 0;
        $scope.zoomMapButtonHeight = 0;
        $scope.zoomListButtonHeight = "44px";
        $ionicScrollDelegate.$getByHandle('listMapScroll').resize();
        loadMap();
      });
      // $mDataLoader.load($scope.moblet, dataLoadOptions)
      //   .then(function(data) {
      //     console.log(data);
      //     // Put the data from the feed in the $scope object
      //     $scope.mapData = data;
      //     // Split the screen in two portions. The show list button is 44px
      //     // and the map will take the remaining portion of the screen.
      //     // The list and the "show map" botton are set to 0.
      //     $scope.mapHeight = screenHeightLessButton();
      //     $scope.listHeight = 0;
      //     $scope.zoomMapButtonHeight = 0;
      //     $scope.zoomListButtonHeight = "44px";
      //
      //     // Set the Ionic scroll javascript to the list of locations
      //     // You need to set 'delegate-handle="listMapScroll"' on the
      //     // HTML
      //     $ionicScrollDelegate.$getByHandle('listMapScroll').resize();
      //
      //     findCenter();
      //     loadMap();
      //   });
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
      console.log($scope.myLocation);
      $scope.firebaseApp.database()
      .ref('locations')
      .push($scope.myLocation);
    };

    $scope.openLocation = function(key) {
      var address = $scope.mapData.locations[key].address;
      var latitude = $scope.mapData.locations[key].latitude;
      var longitude = $scope.mapData.locations[key].longitude;

      $uAlert.dialog(
        $filter('translate')("open_in_map_app_title"),
        $filter('translate')("open_in_map_app_message"),
        [
          $filter('translate')("cancel"),
          $filter('translate')("confirm")
        ]
      )
        .then(function(success) {
          if (success) {
            window.location.href = 'https://www.google.com.br/maps/place/' +
              address + '/@' + latitude + ',' + longitude;
          }
        });
    };
    $rootScope.$on("$$ionicView.afterEnter", function() {
      init();
    });
  }
};
