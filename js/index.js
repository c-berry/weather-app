"use strict";

mapboxgl.accessToken = MAPBOX_API_TOKEN;
//SETS MAP CUSTOMIZATION:
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-98.4916, 29.4252], // starting position [lng, lat]
    zoom: 8 // starting zoom
});

// SET MARKER STARTING POINT>
var marker = new mapboxgl.Marker({
    draggable: true
})
    .setLngLat([-98.491, 29.4252])
    .addTo(map);

function onDragEnd() {
    weatherCoordinates = marker.getLngLat().toArray().reverse();
    getForecast();
    findLocation();
}
marker.on('dragend', onDragEnd);
// <END OF MARKER DRAGGABLE FUNCTIONALITY

// SEARCHBAR FUNCTIONALITY>
var search = '';
$('button').click(function (){
    search = $('#search-place').val();
    searchBar();
});

$(document).on('keypress',function(e) {
    if(e.which === 13) {
        search = $('#search-place').val();
        searchBar();
    }
});

// SETS MARKER LOCATION BASED ON SEARCHBAR:
function searchBar() {
    geocode(search, MAPBOX_API_TOKEN).then(function (search){
        marker.setLngLat(search);
        weatherCoordinates = marker.getLngLat().toArray().reverse();
        // CALLS MAIN FUNCTION TO DISPLAY WEATHER:
        getForecast();
        findLocation();
        // MOVES MAP TO LOCATION:
        map.flyTo({
            center:(search),
            zoom: 8,
            speed: .5
        });
    });
}
// <END OF SEARCHBAR FUNCTIONALITY

// RETRIEVES LONG AND LAT FROM MARKER LOCATION>
function findLocale(){
    var locale = marker._lngLat;
    locale = Object.values(locale);
    var objLocale = {};
    objLocale["lng"] = locale[0];
    objLocale["lat"] = locale[1];
    return objLocale;
}
// CALL FUNCTION TO PULL ADDRESS AND DISPLAY INFO ON PAGE>
function findLocation() {
    reverseGeocode2(findLocale(), MAPBOX_API_TOKEN).then(function (data) {
        $("#location").html("<strong>" + data + "</strong>");
    });
}

// STARTING COORDINATES THAT ARE REDECLARED IN searchBar FUNCTION:
var weatherCoordinates = [
    29.4252,
    -98.491
];

// MAIN FUNCTION >
// RETRIEVES DATA:
function getForecast() {
    $.get("https://api.openweathermap.org/data/2.5/onecall", {
        APPID: WEATHER_TOKEN,
        lat: weatherCoordinates[0],
        lon: weatherCoordinates[1],
        units: "imperial",
        exclude: "minutely,hourly,alerts"
    }).done(function (data) {

        function getIcon(i){
            var icon = data.daily[i].weather[0].icon;
            return '<img src="http://openweathermap.org/img/w/' +  icon + '.png">'
        }

        // HAPPENS AFTER DATA IS RETRIEVED:
        // console.log(data);
        function cycleForecast(data) {
            var html = "";
            for (var i = 0; i < 5; i++) {
                var date = new Date(data.daily[i].dt * 1000).toDateString();
                console.log(date)
                var weatherHigh = data.daily[i].temp.max;
                var weatherLow = data.daily[i].temp.min;
                // var feelsLike = data.daily[i].feels_like.day;
                html += "<div id='weather-box' class='card-body '>"
                    + "<div class=''>" + getIcon(i) + "<br>" + date.slice(0,-4) + "</div><hr>"
                    + "<div>" + "High: " + "<strong>" + Math.round(weatherHigh) + "°F</strong></div>"
                    + "<div>" + "Low: " + "<strong>" + Math.round(weatherLow) + "°F</strong></div>" +
                    // "<div>" + "Currently: " + "<strong>" + feelsLike + "°F</strong>" +
                    // "</div>" +
                    "</div>"
            }
            return html;
        }
        // TARGETS HTML AND INSERTS DATA:
        $("section").html(
            cycleForecast(data)
        );

        console.log(data);
        $("#location1").html("Currently: <strong>" + Math.round(data.current.feels_like) + "°F</strong>");

    });
}

// MAIN FUNCTION CALL:
$(window).on("load", function (){
    getForecast();
    findLocation();
});
