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

var filters = {
    filterTimeLowerBound: null,
    filterTimeUpperBound: null,
    filterUser: null
};


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

    map.addSource('route', {
        'type': 'geojson',
        'data':
            'https://leventguner.net/sd/path.json'
    });

    map.addSource('points', {
        'type': 'geojson',
        'data':
            'https://leventguner.net/sd/points.json'
    });



    map.addLayer(
        {
            'id': 'delivery-points',
            'type': 'circle',
            'source': 'points',
            // 'minzoom': 10,
        },
        //'waterway-label'
    );
    
    map.addLayer({
'id': 'route',
'source': 'route',
'type': 'line',
'paint': {
'line-width': 2,
'line-color': '#007cbf'
}
});


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
}


