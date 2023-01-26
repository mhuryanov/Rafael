var map;
var dataLayer;
var geojsonMarkerOptions = {
    fillColor: "#ff7800", // orange --default if no fillColor in GeoJSON
    color: "#000", // --default if no fillColor in GeoJSON
    weight: 1,
    opacity: 0.5,
    fillOpacity: 0.5,
    pane: ''
}
var allPoints = {}; // all points for time slider
var all_layers_name = []
var truth_layer = false
var flag = false
var all_layer_color = {}

// Keylime frontend
var COLOR_ARRAY = [
    '#FF7F50', '#0000FF', '#A52A2A', '#8A2BE2', '#F4C2C2', '#DEB887', '#5F9EA0',
    '#D2691E', '#FFD700', '#6495ED', '#00FFFF', '#00008B', '#A9A9A9', '#FF8C00',
    '#8B008B', '#B8860B', '#00BFFF', '#2F4F4F', '#FF1493', '#778899', '#9370DB',
    '#9370DB', '#808000', '#DDA0DD', '#FFE4C4'
]

function initMap(divId, latlng, zoomLevel) {
    // init base map -> apple maps
    map = L.map(divId);
    map.createPane("Truth");
    map.getPane("Truth").style.zIndex = 420;
    var mapSrcUrl = 'https://raster-standard.geo.apple.com/tile?style=0&z={z}&x={x}&y={y}';
    var baseLayer = L.tileLayer(mapSrcUrl).addTo(map); //will be our basemap.
    map.setView(latlng, zoomLevel);
    map.addLayer(baseLayer);
}

function onEachFeature(feature, layer) 
{
    // Add the popups (clickable to view / close)
    if (feature.properties && feature.properties.popupContent) {
        var popupOptions = {
            'closeButton': true,
        }
        layer.bindPopup(feature.properties.popupContent, popupOptions);
    }
    if (feature.properties && feature.properties.layer_name === "Truth") {
        truth_layer = true
    }
}

function setFeatureProps(feature) 
{
    var props = geojsonMarkerOptions;

    // Outline color
    if (feature.properties && feature.properties.color) {
        props['color'] = feature.properties.color;
    }
    // Fill color
    if (feature.properties && feature.properties.fillColor) {
        props['fillColor'] = feature.properties.fillColor;
        if (feature.properties.layer_name){
            layer_name = feature.properties.layer_name;
            if(!(layer_name in all_layer_color)){
                all_layer_color[layer_name] = props['fillColor']
            }
        }
    } else{
        // if not carry color, use index of layer to auto assign a color
        flag = true
        if (feature.properties && feature.properties.layer_name)
        {
            layer_index = all_layers_name.indexOf(feature.properties.layer_name)
            props['fillColor'] = getColor(layer_index);
        }
    }
    // Pane for z-index
    if (feature.properties && feature.properties.layer_name) {
        props['pane'] = feature.properties.layer_name;
    }
    return props;
}

function pointToLayer(feature, latlng)
{
    if (feature.properties && feature.properties.layer_name)
    {
        layer_name = feature.properties.layer_name;
        if(!(layer_name in allPoints)){
            allPoints[layer_name] = []
            all_layers_name.push(layer_name)
            map.createPane(layer_name);
        }
    }

    var marker;
    // default circle marker if not a fence
    //marker = L.circleMarker(latlng, setFeatureProps(feature));
    marker = L.circleMarker(latlng);

    if (feature.properties && feature.properties.radius) {
        var rad = feature.properties.radius;
        //marker = L.circle(latlng, {radius: rad}, setFeatureProps(feature));
        marker = L.circle(latlng, {radius: rad});
    }
    allPoints[layer_name].push(marker)
    feature.latlng = latlng;
    return marker;
}

function addDataToMap(layer_id) 
{
    var data = new L.geoJson(dataLayer, {
            style: setFeatureProps,
            pointToLayer: pointToLayer,
            onEachFeature: onEachFeature,
        }).addTo(map);
    if (dataLayer.features.length > 0)
    {
        // auto fit map to data added to map
        map.fitBounds(data.getBounds());    
        // todo: Need to investigate following if necessary
        // map.addLayer(data);
    }
    return data;
}

function getColor(index) {
//    return index === 1 ? "#F4C2C2" : // red
//           index === 2  ? "#00CC99" : // green
//           index === 3 ? "#1F75FE" : // blue
//           index === 4 ? "#FFF600" : // yellow
//           index === 5 ? "#C19A6B" : // light brown
//           index === 6 ? "#006A4E" : // dark green
//                        "#00000";
    if (index < COLOR_ARRAY.length)
    {
        return COLOR_ARRAY[index];
    }
    else{
        return "#00000";
    }
}

function generateMap(divId, latlng, zoomLevel, dataToPlot) 
{
    initMap(divId, latlng, zoomLevel);
    var i;
    var layers_list = [];
    // separating FeatureCollection into different layers
    for(i = 0; i < dataToPlot.length; i++)
    {
        dataLayer = dataToPlot[i]
        layers_list.push(addDataToMap(i));
    }
    console.log(all_layers_name)

    // handles which layers are actually given from the geojson data
    var overlayMaps = {}
    var ind = 0
    // since truth is the only one using polyline, it's uncaptured by the allpoints
    // this help the layers not mess up when through is included
    if (truth_layer)
    {
        overlayMaps["Truth"] = layers_list[ind]
        ind++
    }
    for (var k in allPoints)
    {
        if (allPoints[k].length !== 0)
        {
            overlayMaps[k] = layers_list[ind]
            ind++
        }
    }
    var selectableControl = L.control.layers(null, overlayMaps).addTo(map);

    // time slider
    lstPoints = []
    Object.keys(allPoints).forEach(function(key) {
        lstPoints = lstPoints.concat(allPoints[key])
    });
    layerGroup = L.layerGroup(lstPoints);
    var sliderControl = L.control.sliderControl({
        position: "topright",
        layer: layerGroup,
        control: selectableControl,
        range: true});
    map.addControl(sliderControl);
    sliderControl.startSlider();

    // var flags = [], output = [], l = all_layer_color.length, i;
    // for( i=0; i<l; i++) {
    // if( flags[all_layer_color[i].age]) continue;
    // flags[all_layer_color[i].age] = true;
    // output.push(all_layer_color[i].age);
    // }

    // adding legend of map
    var legend = L.control({position: 'topright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'legend');
        labels = []
        for (var i = 0; i < all_layers_name.length; i++)
        {
            if (flag)
            {
                div.innerHTML += 
                labels.push(
                    '<i class="circle" style="background:' + getColor(i) + '"></i> ' +
                    (all_layers_name[i]));
            }
            else
            {
                div.innerHTML += 
                labels.push(
                    '<i class="circle" style="background:' + all_layer_color[all_layers_name[i]] + '"></i> ' +
                    (all_layers_name[i]));

            }
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(map);

    // var timeDimension = new L.TimeDimension({
    //   period:     "PT180M",
    //   autoPlay:   false,
    //   timeSlider: true,
    //   loopButton: true,
    //   startOver:  true
    // });

    // map.timeDimension = timeDimension; 

    // var player = new L.TimeDimension.Player({
    //   transitionTime: 800, 
    //   loop: true
    // }, timeDimension); 


    // var timeDimensionControlOptions = {
    //   player:               player,
    //   timeDimension:        timeDimension,
    //   position:             'bottomleft',
    //   autoPlay:             true,
    //   backwardButton:       false,
    //   forwardButton:        false,
    //   minSpeed:             1,
    //   speedStep:            1,
    //   maxSpeed:             15,
    //   timeSliderDragUpdate: true
    // };

    // var timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);
    // map.addControl(timeDimensionControl);
}
