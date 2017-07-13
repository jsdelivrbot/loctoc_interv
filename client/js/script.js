// script.js
var myApp = angular.module('webapp', ['ngRoute', 'firebase']);
var map;
var config = {
    apiKey: "AIzaSyC3AFp66yHrTS5OzC1KogV88iklAAcYF5Q",
    authDomain: "loctoc-interview.firebaseapp.com",
    databaseURL: "https://loctoc-interview.firebaseio.com",
    projectId: "loctoc-interview",
    storageBucket: "loctoc-interview.appspot.com",
    messagingSenderId: "744754369626"
};
firebase.initializeApp(config);

//map key
//AIzaSyC3AFp66yHrTS5OzC1KogV88iklAAcYF5Q
myApp.config(function ($routeProvider, $sceDelegateProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'html/godview.html',
            controller: 'cntrl'
        })
        .when('/detail', {
            templateUrl: 'html/detailview.html',
            controller: 'cntrl'
        });


});






myApp.controller('cntrl', function ($scope, $http, $interval, $timeout, $compile, $firebaseObject) {

    $scope.sidelane = 0;
    $scope.maplane = 12;

    $scope.selected_driver = null;


    var ref = firebase.database().ref("drivers");
    // download the data into a local object
    var obj = $firebaseObject(ref);

    $scope.drivers_list = [];

    initMap($("#godmap"), mapOptions);


    obj.$loaded().then(function () {
        console.log("loaded record:", obj.$id, obj.someOtherKeyInData);

        // To iterate the key/value pairs of the object, use angular.forEach()
        angular.forEach(obj, function (value, key) {
            console.log(key, value);


            $scope.drivers_list.push(value);

        });
    });


    var unwatch = obj.$watch(function () {

        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }

        angular.forEach(obj, function (value, key) {
            //          console.log(key, value);
            //remove all markers
            if ($scope.selected_driver == null) {
                setMarker(map, new google.maps.LatLng(value.lat, value.long), value.name, value.phone, value.name,false);
            } else if ($scope.selected_driver == value.name) {
                setMarker(map, new google.maps.LatLng(value.lat, value.long), value.name, value.phone, value.name,true);
            }


        });
        
        setBounds();
        
    });



    $scope.onDetail = function () {
        $scope.selected_driver = '';
        //show the sidelane with driver info
        $scope.sidelane = 4;
        $scope.maplane = 8;

        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }


    }

    $scope.onGod = function () {
        $scope.selected_driver = null;
        //hide the sidelane with driver info
        $scope.sidelane = 0;
        $scope.maplane = 12;

        obj.$loaded().then(function () {


            // To iterate the key/value pairs of the object, use angular.forEach()
            angular.forEach(obj, function (value, key) {

                
                    setMarker(map, new google.maps.LatLng(value.lat, value.long), value.name, value.phone, value.name,false);
                

            });
            
//            setBounds();
        });

        //        initMap($("#godmap"), mapOptions);
    }


    $scope.onSelectDriver = function (dName) {
        $scope.selected_driver = dName;

        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }

        obj.$loaded().then(function () {


            // To iterate the key/value pairs of the object, use angular.forEach()
            angular.forEach(obj, function (value, key) {

                if ($scope.selected_driver == value.name) {
                    setMarker(map, new google.maps.LatLng(value.lat, value.long), value.name, value.phone, value.name,true);
                }

            });
            
//            setBounds();
        });
    }







});



var markers = [];
var infoWindow;

var mapOptions = {
    center: new google.maps.LatLng(-0.717298, -0.458621),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false
};


function setBounds(){
    var bounds = markers.reduce(function(bounds, marker) {
        return bounds.extend(marker.getPosition());
    }, new google.maps.LatLngBounds());

    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
}

function setMarker(map, position, title, content, label,shouldOpen) {
    var marker;
    var markerOptions = {
        position: position,
        map: map,
        title: title,
//        label: label,
        icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
    };

    marker = new google.maps.Marker(markerOptions);
    
    if(shouldOpen){
        var infoWindowOptions = {
            content: "<div><b>"+title+"</b><br><br>"+content+"</div>"
        };
        infoWindow = new google.maps.InfoWindow(infoWindowOptions);
        infoWindow.open(map, marker);
    }
    
    markers.push(marker); // add marker to array
    

    google.maps.event.addListener(marker, 'click', function () {
        // close window if not undefined
        if (infoWindow !== void 0) {
            infoWindow.close();
        }
        // create new window
        var infoWindowOptions = {
            content: "<div><b>"+title+"</b><br><br>"+content+"</div>"
        };
        infoWindow = new google.maps.InfoWindow(infoWindowOptions);
        infoWindow.open(map, marker);
    });
}

function initMap(element, mapOptions) {
    if (map === void 0) {
        map = new google.maps.Map(element[0], mapOptions);
    }
}

myApp.directive('myMap', function () {
    // directive link function
    var link = function (scope, element, attrs) {



        // show the map and place some markers
        initMap(element, mapOptions);


    };

    return {
        restrict: 'A',
        template: '<div id="gmaps"></div>',
        replace: true,
        link: link
    };
});