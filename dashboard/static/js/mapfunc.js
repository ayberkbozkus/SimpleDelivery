mapboxgl.accessToken = 'pk.eyJ1IjoidG9wZ3VuIiwiYSI6ImNrYWZmZ2kwbzBzemEycG1iMXYxcWoxdWkifQ.Y2KVrAprIrtUhw4SQlW82w';
var center = [29.0245, 41.1067];
var map = new mapboxgl.Map({
    container: 'map',
    zoom: 9.5,
    center: center,
    pitch: 60,
    bearing: -5,
    style: 'mapbox://styles/mapbox/light-v10'
});
var layerList = document.getElementById('menu2');
var inputs = layerList.getElementsByTagName('input');
var layerList = document.getElementById('menu2');
var inputs = layerList.getElementsByTagName('input');
var filters = {
    filterTimeLowerBound: null,
    filterTimeUpperBound: null,
    filterUser: null
};
var sliderRange;
var mapNames = ['temp-point', 'temp-heat'];
var simState = {
    rangeLocked: true,
    range: 600000,
    step: 0,
    stepSize: 600000,
    lower: 0,
    upper: 0,
    defaultSpeed: 1000,
    currentSpeed: 1000,
    isPlaying: false,
    updateStatePlaying: function() {
        this.isPlaying = true;
    },
    updateStateStopped: function() {
        this.isPlaying = false;
    },
    updateSpeed: function(factor) {
        this.currentSpeed = this.defaultSpeed / factor;
    },
    updateStateTimeRange: function(lower, upper) {
        this.lower = lower;
        this.upper = upper;
    },
    initStep: function() {
        this.step = 0;
    },
    updateStepSize: function(stepSize_) {
        this.stepSize = stepSize_;
    },
    updateRange: function(range_) {
        this.range = range_;
    },
    updateStep: function (step_) {
        this.step = step_;
    },
    getSliderRange: function() {
        return (this.upper - this.lower)/this.range;
    },
    setSliderValue: function(i) {
        console.log("here");
        var val = 100*(i - this.lower)/(this.upper - this.lower);
        //sliderRange.enable();
        sliderRange.setValue([val, val + this.getSliderRange()]);
        //sliderRange.disable();
    }
}
$(document).ready(function () {
    $(function () {
        var d = new Date();
        var now = d.getTime()
        $('#datetimepicker6').datetimepicker({
            useCurrent: false,
            defaultDate: moment(now - 86400000),
            locale: 'tr'
        });
        $('#datetimepicker7').datetimepicker({
            useCurrent: false, //Important! See issue #1075
            defaultDate: moment(now),
            locale: 'tr'
        });
        $("#datetimepicker6").on("dp.change", function (e) {
            $('#datetimepicker7').data("DateTimePicker").minDate(e.date);
        });
        $("#datetimepicker7").on("dp.change", function (e) {
            $('#datetimepicker6').data("DateTimePicker").maxDate(e.date);
        });
    });
    sliderRange = new Slider("#range-slider-text", {
        id: "range-slider",
        min: 0,
        max: 100,
        step: 1,
        range: true,
        value: [0, 10]
    });
    sliderRange.on("change", function(sliderValue) {
        if(simState.rangeLocked) {
            sliderRange.disable();
            /*console.log(simState.getSliderRange());
            console.log("aaa");
            console.log(sliderValue.newValue[1] - sliderValue.newValue[0]);*/
            var range_ = simState.getSliderRange();
            if((sliderValue.newValue[1] - sliderValue.newValue[0] < range_) && (sliderValue.newValue[1] == 100 || sliderValue.newValue[0] == 0))
            {
                if(sliderValue.newValue[1] == 100)
                {
                    sliderRange.setValue([100 - range_, 100]);
                }
                else if (sliderValue.newValue[0] == 0)
                {
                    sliderRange.setValue([0, 0 + range_]);
                }
            }
            else if(sliderValue.oldValue[0] === sliderValue.newValue[0])
            {
                sliderRange.setValue([sliderValue.newValue[1] - range_, sliderValue.newValue[1]]);
            }
            else if(sliderValue.oldValue[1] === sliderValue.newValue[1])
            {
                sliderRange.setValue([sliderValue.newValue[0], sliderValue.newValue[0] + range_]);
            }
            sliderRange.enable();
        }
        var chck = sliderRange.getValue();
        console.log(chck[1]-chck[0]);
    });
    var sliderSpeed = new Slider("#speed-slider-text", {id: "speed-slider", min: 0.5, max: 5, step: 0.5, value: 1});
    sliderSpeed.on("change", function (sliderValue) {
        //document.getElementById("ex6SliderVal").textContent = sliderValue;
        simState.updateSpeed(sliderValue.newValue);
    });
});

function filterCore() {
    currentFilters = Object.values(filters).filter((obj) => obj);
    currentFilters.unshift('all');
    for (var i = 0; i < mapNames.length; i++) {
        map.setFilter(mapNames[i], currentFilters);
    }
}

function filterForTimeRange(bounds = null) {
    if (bounds == null) {
        filters.filterTimeLowerBound = ['>=', ['number', ['get', 'tstamp']], parseInt($('#datetimepicker6').data("DateTimePicker").date().format('x')) + 10800000];
        filters.filterTimeUpperBound = ['<', ['number', ['get', 'tstamp']], parseInt($('#datetimepicker7').data("DateTimePicker").date().format('x')) + 10800000];
    } else {
        filters.filterTimeLowerBound = ['>=', ['number', ['get', 'tstamp']], bounds[0] + 10800000];
        filters.filterTimeUpperBound = ['<', ['number', ['get', 'tstamp']], bounds[1] + 10800000];
    }
    filterCore();

}

function filterForUser(userId) {
    filters.filterUser = ['==', ['number', ['get', 'user']], userId];
    filterCore();
}

function switchLayer(layer) {
    document.getElementById('allUsers').style.visibility = "hidden";
    var layerId = layer.target.id;
    const option = Object.create({diff: true});
    var oldcenter = map.getCenter();
    var oldzoom = map.getZoom();
    var oldpitch = map.getPitch();
    var oldbearing = map.getBearing();
    map.remove();
    map = new mapboxgl.Map({
        container: 'map',
        zoom: oldzoom,
        center: oldcenter,
        pitch: oldpitch,
        bearing: oldbearing,
        style: 'mapbox://styles/mapbox/' + layerId
    });
    map.on('load', function () {
        initializeMap(map);

    });
    //map.addLayer(mapboxgl.styleLayer('mapbox://styles/mapbox/' + layerId));
    //map.setStyle('mapbox://styles/mapbox/' + layerId, option);
    updateFilters();
}

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}


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

function addDataLayer() {
    var d = new Date();
    /*document.getElementById("active-hour").innerText = d.getHours();
    var filterValue = getFormattedHour() - 1000000;
    var filterLastDay = ['>=', ['number', ['get', 'timestamp']], filterValue];*/


    var layers = map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    var firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    map.addSource('people', {
        'type': 'geojson',
        'data':
            'http://160.75.154.58:5000/realdata'
    });

    map.addSource('towns', {
        'type': 'geojson',
        'data':
            'http://160.75.154.58:5000/towns'
    });


    map.addLayer({
        'maxzoom': 13,
        'id': 'townlayer',
        'type': 'fill',
        'source': 'towns',
        'layout': {},
        'paint': {
            'fill-color': ['match', ['get', 'name'], // get the property
                'Sarıyer', 'rgb(187,215,108)',
                'Eyüpsultan', 'rgb(119,221,119)',
                'Beşiktaş', 'rgb(119,221,119)',
                'Bağcılar', 'rgb(255,210,97)',
                'Küçükçekmece', 'rgb(255,157,97)',
                'Gaziosmanpaşa', 'rgb(187,215,108)',
                'Kağıthane', 'rgb(255,210,97)',
                'Beyoğlu', 'rgb(119,221,119)',
                'Sancaktepe', 'rgb(119,221,119)',
                'rgba(0,0,0,0.25)'],

            'fill-opacity': 0.3
        }
    }, firstSymbolId);

    // When a click event occurs on a feature in the states layer, open a popup at the
// location of the click, with description HTML from its properties.
    map.on('click', 'townlayer', function (e) {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.name)
            .addTo(map);
        openRightMenu('content5');
        townInfo(e.features[0].properties.name);
    });


// Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'townlayer', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

// Change it back to a pointer when it leaves.
    map.on('mouseleave', 'townlayer', function () {
        map.getCanvas().style.cursor = '';
    });


    map.on('mouseenter', 'temp-point', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

// Change it back to a pointer when it leaves.
    map.on('mouseleave', 'temp-point', function () {
        map.getCanvas().style.cursor = '';
    });

    map.addLayer(
        {
            'id': 'temp-point',
            'type': 'circle',
            'source': 'people',
            // 'minzoom': 10,
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
                    'rgb(60,176,80)',
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
        },
        //'waterway-label'
    );
    controlMap("temp-point-check");


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
                    0.001,
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
                    'rgba(50,146,70,0.8)',
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
        },
        //'waterway-label'
    );
    controlMap("temp-heat-check");
}

map.on('load', function () {
    toggleSidebar('right');
    initializeMap(map);
});

var openNumber = 0;

function myFunction(x) {
    x.classList.toggle("change");
    openNumber++;
}

function initializeMap(map) {
    addDataLayer();
    map.on('click', 'temp-point', function (e) {
        var curzoom = map.getZoom()
        if (curzoom > 13) {
            var userno = e.features[0].properties.user;
            searchFunction(userno);
            if (openNumber % 2 == 0) {
                toggleSidebar('left');
                openNumber++;
            }

            var coordinates = e.features[0].geometry.coordinates.slice();
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
        }
    });

// Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

// Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
    });
    filterForTimeRange();
}

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

/*document.getElementById('slider').addEventListener('input', function (e) {
    var hour = parseInt(e.target.value);
    filterForHours(hour);
});

document.getElementById('slider').addEventListener('click', function () {
    var sliderValue = document.getElementById("slider");
    var hour = parseInt(sliderValue.value);
    filterForHours(hour);
});

function filterForHours(hour, filterUser = null, filterHourMinute = 0) {
    var dayFilterCheck = document.getElementById("cumulative-checkbox");
    dayFilterCheck.checked = false;
    var d = new Date().getHours();
    // update the map
    var filterHour = (d + 1 + hour) % 24;
    var filterValue = getFormattedDay() + filterHour * 10000 + filterHourMinute;
    if (filterHour > d) {
        filterValue -= 1000000;
    }
    var filterHourGreater = ['==', ['number', ['get', 'timestamp']], filterValue];
    //var filterHourLess = ['<', ['number', ['get', 'timestamp']], (hour+1)*3600000000000];
    var filters;
    if (filterUser == null) {
        filters = ['all', filterHourGreater];
    } else {
        filters = ['all', filterHourGreater, filterUser];
    }
    map.setFilter('temp-point', filters);//, filterHourLess]);
    map.setFilter('temp-heat', filters);//, filterHourLess]);

    // converting 0-23 hour to AMPM format
    // update text in the UI
    document.getElementById('active-hour').innerText = filterHour.toString() + ":00";
}

function getFormattedDay() {
    var d = new Date();
    var filterValue = d.getFullYear() * 10000000000;
    filterValue += (d.getMonth() + 1) * 100000000;
    filterValue += d.getDate() * 1000000;
    return filterValue;
}

function getFormattedHour() {
    var d = new Date();
    var filterValue = d.getFullYear() * 10000000000;
    filterValue += (d.getMonth() + 1) * 100000000;
    filterValue += d.getDate() * 1000000;
    filterValue += d.getHours() * 10000;
    return filterValue;
}

function filterForLastDay(id, filterUser = null) {
    var check = document.getElementById(id);
    if (check.checked) {
        var filterValue = getFormattedHour() - 1000000;
        var filterLastDay = ['>=', ['number', ['get', 'timestamp']], filterValue];
        var filters;
        if (filterUser == null) {
            filters = ['all', filterLastDay];
        } else {
            filters = ['all', filterLastDay, filterUser];
        }
        map.setFilter('temp-point', filters);//, filterHourLess]);
        map.setFilter('temp-heat', filters);//, filterHourLess]);
    } else {
        var sliderValue = document.getElementById("slider");
        filterForHours(parseInt(sliderValue.value));
    }
}*/

function filterForSick() {
    var filterValue = 38;
    var filterTemp = ['>', ['number', ['get', 'temp']], filterValue];

    filters = ['all', filterTemp];

    map.setFilter('temp-point', filters);
    map.setFilter('temp-heat', filters);
    return false;
}

function filterForRisk() {
    var filterValueMin = 36.8;
    var filterValueMax = 38;
    var filterTemp1 = ['>=', ['number', ['get', 'temp']], filterValueMin];
    var filterTemp2 = ['<', ['number', ['get', 'temp']], filterValueMax];
    filters = ['all', filterTemp1, filterTemp2];

    map.setFilter('temp-point', filters);
    map.setFilter('temp-heat', filters);
    return false;
}

function filterForHealthy() {
    var filterValue = 36.8;
    var filterTemp = ['<', ['number', ['get', 'temp']], filterValue];

    filters = ['all', filterTemp];

    map.setFilter('temp-point', filters);
    map.setFilter('temp-heat', filters);
    return false;
}

function filterForRiskAreas() {
    var filterValue = 37;
    var filterTemp = ['>', ['number', ['get', 'temp']], filterValue];

    filters = ['all', filterTemp];

    map.setFilter('temp-point', filters);
    map.setFilter('temp-heat', filters);
    return false;
}

function updateFilters(filterUser = null) {
    var dayFilterCheck = document.getElementById("cumulative-checkbox");
    if (dayFilterCheck.checked == true) {
        filterForLastDay("cumulative-checkbox", filterUser);
    } else {
        var sliderValue = document.getElementById("slider");
        var hour = parseInt(sliderValue.value);
        filterForHours(hour, filterUser);
    }
}

function returntoAllUsers() {
    filters.filterUser = null;
    filterCore();
    var oldzoom = map.getZoom()
    map.flyTo({
        center: center,
        zoom: oldzoom - 1,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
}

function filterClick() {
    filterForTimeRange();
    var lower = parseInt($('#datetimepicker6').data("DateTimePicker").date().format('x'));
    var upper = parseInt($('#datetimepicker7').data("DateTimePicker").date().format('x'));
    simState.updateStateTimeRange(lower, upper);
    simState.initStep();
    var stepSize = 600000;
    simState.updateStepSize(stepSize);
    simState.updateRange((upper-lower)/10);
    document.getElementById("range-lock").checked = true;
    simState.rangeLocked = true;
}

const simulateInTimeRange = async () => {
    controlFiltersAndStyles();
    var i;
    simState.updateStatePlaying();
    $('#datetimepicker6').data("DateTimePicker").disable();
    $('#datetimepicker7').data("DateTimePicker").disable();
    for (i = simState.lower+(sliderRange.getValue()[0])*(simState.upper-simState.lower)/100; i < simState.upper - simState.range && simState.isPlaying; i += simState.stepSize) {
        /*$('#datetimepicker6').data("DateTimePicker").date(moment(i));
        $('#datetimepicker7').data("DateTimePicker").date(moment(i+600000));*/
        await sleep(simState.currentSpeed);
        filterForTimeRange([i, i + simState.range]);
        simState.setSliderValue(i);
    }
    simState.updateStep(i);
    controlFiltersAndStyles();
    $('#datetimepicker6').data("DateTimePicker").enable();
    $('#datetimepicker7').data("DateTimePicker").enable();
}

function stopSimulation() {
    simState.updateStateStopped();
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function controlFiltersAndStyles() {
    sliderRange.toggle();
    elm = document.getElementById("temp-heat-check");
    elm.disabled = !elm.disabled;
    elm = document.getElementById("temp-point-check");
    elm.disabled = !elm.disabled;
    elm = document.getElementById("streets-v11");
    elm.disabled = !elm.disabled;
    elm = document.getElementById("light-v10");
    elm.disabled = !elm.disabled;
    elm = document.getElementById("dark-v10");
    elm.disabled = !elm.disabled;
    elm = document.getElementById("outdoors-v11");
    elm.disabled = !elm.disabled;
    elm = document.getElementById("play");
    elm.disabled = !elm.disabled;
}

function resetMap() {
    filters = {
        filterTimeLowerBound: null,
        filterTimeUpperBound: null,
        filterUser: null
    };
    var d = new Date();
    var now = d.getTime();
    $('#datetimepicker7').data("DateTimePicker").minDate(moment(now - 86400000));
    $('#datetimepicker6').data("DateTimePicker").maxDate(moment(now));
    $('#datetimepicker6').data("DateTimePicker").date(moment(now - 86400000));
    $('#datetimepicker7').data("DateTimePicker").date(moment(now));
    filterForTimeRange();
    map.flyTo({
        center: center,
        zoom: 9.5,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
}
