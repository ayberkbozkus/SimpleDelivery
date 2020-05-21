mapboxgl.accessToken = 'pk.eyJ1IjoidG9wZ3VuIiwiYSI6ImNrYWZmZ2kwbzBzemEycG1iMXYxcWoxdWkifQ.Y2KVrAprIrtUhw4SQlW82w';
var center = [29.0308,40.9929];
var map = new mapboxgl.Map({
    container: 'map',
    zoom: 14,
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


    var point = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'Point',
                    'coordinates': origin
                }
            }
        ]
    };

    var route = JSON.parse(Get('https://leventguner.net/sd/path.json'));

    map.addSource('route', {
        'type': 'geojson',
        'data': route
    });

    map.addSource('homes', {
        'type': 'geojson',
        'data':
            'https://leventguner.net/sd/points.json'
    });

    map.addSource('point', {
        'type': 'geojson',
        'data': point
    });

    map.addLayer(
        {
            'id': 'delivery-points',
            'type': 'symbol',
            'source': 'homes',
            'layout': {
            'icon-image': 'town-hall-15',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
        }
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


    map.addLayer({
        'id': 'point',
        'source': 'point',
        'type': 'symbol',
        'layout': {
            'icon-image': 'shop-15',
            'icon-rotate': ['get', 'bearing'],
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,

        }
    });
    var route_len = route.features[0].geometry.coordinates.length;
    var steps = route_len;
    var anim_counter = 0;

    function animate() {
// Update point geometry to a new position based on anim_counter denoting
// the index to access the arc.
        point.features[0].geometry.coordinates =
            route.features[0].geometry.coordinates[anim_counter];

// Calculate the bearing to ensure the icon is rotated to match the route arc
// The bearing is calculate between the current point and the next point, except
// at the end of the arc use the previous point and the current point
        point.features[0].properties.bearing = turf.bearing(
            turf.point(
                route.features[0].geometry.coordinates[
                    anim_counter >= steps ? anim_counter - 1 : anim_counter
                    ]
            ),
            turf.point(
                route.features[0].geometry.coordinates[
                    anim_counter >= steps ? anim_counter : anim_counter + 1
                    ]
            )
        );

// Update the source with this new data.
        map.getSource('point').setData(point);

// Request the next frame of animation so long the end has not been reached.
        if (anim_counter < steps) {
            requestAnimationFrame(animate);
        }

        anim_counter = anim_counter + 1;
    }

    document.getElementById('replay').addEventListener('click', function () {
// Set the coordinates of the original point back to origin
        point.features[0].geometry.coordinates = origin;

// Update the source layer
        map.getSource('point').setData(point);

// Reset the anim_counter
        anim_counter = 0;

// Restart the animation.
        animate(anim_counter);
    });

// Start the animation.
    animate(anim_counter);

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


