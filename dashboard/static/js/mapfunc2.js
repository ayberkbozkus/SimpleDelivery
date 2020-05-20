mapboxgl.accessToken = 'pk.eyJ1IjoibGV2ZW50ZyIsImEiOiJjazlkOHl6YTcwMTAyM2tvOXdpZmU4bjNyIn0.8xTW9MUYeO0-yNMmZr-TwQ';
var center = [29.0245,
          41.1067];
var map = new mapboxgl.Map({
    container: 'map',
    zoom: 9.5,
    center: center,
    pitch: 60,
    bearing: -5,
    style: 'mapbox://styles/mapbox/dark-v10'
});
var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

/*function switchLayer(layer) {
    var layerId = layer.target.id;
    map.setStyle('mapbox://styles/mapbox/' + layerId);
}

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}*/

// new mapboxgl.Marker().setLngLat(center).addTo(map);

function toggleSidebar(id) {
    var elem = document.getElementById(id);
    var classes = elem.className.split(' ');
    var collapsed = classes.indexOf('collapsed') !== -1;

    var padding = {};

    if (collapsed) {
// Remove the 'collapsed' class from the class list of the element, this sets it back to the expanded state.
        classes.splice(classes.indexOf('collapsed'), 1);

        padding[id] = 300; // In px, matches the width of the sidebars set in .sidebar CSS class
        map.easeTo({
            padding: padding,
            duration: 1000 // In ms, CSS transition duration property for the sidebar matches this value
        });
    } else {
        padding[id] = 0;
        // Add the 'collapsed' class to the class list of the element
        classes.push('collapsed');

        map.easeTo({
        padding: padding,
        duration: 1000
        });
        }



// Update the class list on the element
    elem.className = classes.join(' ');
}

map.on('load', function () {
    var d = new Date();
    document.getElementById("active-hour").innerText = d.getHours();
    var filterValue = getFormattedHour() - 100;
    var filterLastDay = ['>=', ['number', ['get', 'timestamp']], filterValue];

    map.addSource('people', {
        'type': 'geojson',
        'data':
            'http://160.75.154.58:5000/realdata'
    });
//point
map.addLayer(
        {
            'id': 'temp-point',
            'type': 'circle',
            'source': 'people',
            'minzoom': 13,
            'paint': {
// Size circle radius by earthquake magnitude and zoom level
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    7,
                    ['interpolate', ['linear'], ['get', 'temp'], 35, 3, 38, 4.5],
                    16,
                    ['interpolate', ['linear'], ['get', 'temp'], 35, 4, 38, 6.5]
                ],
// Color circle by earthquake magnitude
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'temp'],
                    33,
                    'rgba(119,221,119,0)',
                    36,
                    'rgba(119,221,119,0.7)',
                    37,
                    'rgba(187,215,108,0.8)',
                    37.5,
                    'rgb(255,210,97)',
                    38,
                    'rgb(255,157,97)',
                    39,
                    'rgb(255,105,97)'


                ],

// Transition from heatmap to circle layer by zoom level
                'circle-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    7,
                    0,
                    8,
                    1
                ]
            },
            'filter': ['all', filterLastDay]
        },
        'waterway-label'
    );

//heatmap
    map.addLayer(
        {
            'id': 'temp-heat',
            'type': 'heatmap',
            'source': 'people',
            'maxzoom': 20,
            'paint': {
// Increase the heatmap weight based on frequency and property magnitude
                'heatmap-weight': [
                    'interpolate',
                    ['linear'],
                    ['get', 'temp'],
                    35,
                    0,
                    36,
                    0.002,
                    37,
                    0.002,
                    37.2,
                    0.15,
                    37.5,
                    0.3,
                    38,
                    0.5,
                    39,
                    1
                ],
// Increase the heatmap color weight weight by zoom level
// heatmap-intensity is a multiplier on top of heatmap-weight
                'heatmap-intensity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0,
                    1,
                    17,
                    10
                ],
// Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
// Begin color ramp at 0-stop with a 0-transparancy color
// to create a blur-like effect.
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(119,221,119,0)',
                    0.2,
                    'rgba(119,221,119,0.8)',
                    0.6,
                    'rgba(187,215,108,0.8)',
                    0.8,
                    'rgba(255,210,97,0.8)',
                    0.99,
                    'rgba(255,157,97,0.8)',
                    1,
                    'rgba(255,105,97,0.8)'


                ],
// Adjust the heatmap radius by zoom level
                'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0,
                    2,
                    9,
                    25
                ],
// Transition from heatmap to circle layer by zoom level
                'heatmap-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    7,
                    1,
                    30,
                    0
                ]
            },
            'filter': ['all', filterLastDay]
        },
        'waterway-label'
    );




    map.on('click', 'temp-point', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var userno = e.features[0].properties.user;
        searchFunction(userno);
        var description = 'Kullanıcı: ' + e.features[0].properties.user + '<br>';
        description += 'Vücut sıcaklığı: ' + Math.round(e.features[0].properties.temp * 100) / 100 + ' °C<br>';
        description += 'Zaman: ' + e.features[0].properties.last_time + '<br>';
        description += 'Doğruluk: ' + e.features[0].properties.accuracy;
// Ensure that if the map is zoomed out such that multiple
// copies of the feature are visible, the popup appears
// over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

// Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

// Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
    });

});
var toggleableLayerIds = {"temp-heat-check": 'temp-heat', "temp-point-check": 'temp-point'};

function controlMap(id) {

    var check = document.getElementById(id);

    if (check.checked == true) {
        //this.className = 'active';
        map.setLayoutProperty(toggleableLayerIds[id], 'visibility', 'visible');
    } else {

        map.setLayoutProperty(toggleableLayerIds[id], 'visibility', 'none');
        //this.className = '';
    }

    // toggle layer visibility by changing the layout object's visibility property
}

document.getElementById('slider').addEventListener('input', function(e) {
    var hour = parseInt(e.target.value);
    filterForHours(hour);
});

document.getElementById('slider').addEventListener('click', function() {
    var sliderValue = document.getElementById("slider");
    var hour = parseInt(sliderValue.value);
    filterForHours(hour);
});

function filterForHours(hour, filterUser=null)
{
    var dayFilterCheck = document.getElementById("cumulative-checkbox");
    dayFilterCheck.checked = false;
    var d = new Date().getHours();
    // update the map
    var filterHour = (d + 1 + hour) % 24;
    var filterValue = getFormattedDay() + filterHour;

    if(filterHour > d)
    {
        filterValue -= 100;
    }
    console.log(filterValue);
    var filterHourGreater = ['==', ['number', ['get', 'timestamp']], filterValue];
    //var filterHourLess = ['<', ['number', ['get', 'timestamp']], (hour+1)*3600000000000];
    var filters;
    if(filterUser == null)
    {
        filters = ['all', filterHourGreater];
    }
    else
    {
        filters = ['all', filterHourGreater, filterUser];
    }
    map.setFilter('temp-point', filters);//, filterHourLess]);
    map.setFilter('temp-heat', filters);//, filterHourLess]);

    // converting 0-23 hour to AMPM format
    // update text in the UI
    document.getElementById('active-hour').innerText = filterHour.toString() + ":00";
}

function getFormattedDay()
{
    var d = new Date();
    var filterValue = d.getFullYear()*1000000;
    filterValue += (d.getMonth()+1)*10000;
    filterValue += d.getDate()*100;
    return filterValue;
}

function getFormattedHour()
{
    var d = new Date();
    var filterValue = d.getFullYear()*1000000;
    filterValue += (d.getMonth()+1)*10000;
    filterValue += d.getDate()*100;
    filterValue += d.getHours();
    return filterValue;
}

function filterForLastDay(id, filterUser=null)
{
    var check = document.getElementById(id);
    if(check.checked)
    {
        var filterValue = getFormattedHour() - 100;
        var filterLastDay = ['>=', ['number', ['get', 'timestamp']], filterValue];
        var filters;
        if(filterUser == null)
        {
            filters = ['all', filterLastDay];
        }
        else
        {
            filters = ['all', filterLastDay, filterUser];
        }
        console.log(filters);
        map.setFilter('temp-point', filters);//, filterHourLess]);
        map.setFilter('temp-heat', filters);//, filterHourLess]);
    }
    else
    {
        var sliderValue = document.getElementById("slider");
        console.log(parseInt(sliderValue.value));
        filterForHours(parseInt(sliderValue.value));
    }
}

function updateFilters(filterUser=null)
{
    var dayFilterCheck = document.getElementById("cumulative-checkbox");
    if(dayFilterCheck.checked == true)
    {
        filterForLastDay("cumulative-checkbox", filterUser);
    }
    else
    {
        var sliderValue = document.getElementById("slider");
        var hour = parseInt(sliderValue.value);
        filterForHours(hour, filterUser);
    }
}

function returntoAllUsers()
{
    var allUsersButton = document.getElementById("allUsers");
    allUsersButton.style.visibility =  "hidden";
    console.log("oou yea");
    updateFilters();
    map.flyTo({
        center: center,
        zoom:10,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
}
