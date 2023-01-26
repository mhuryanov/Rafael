L.Control.SliderControl = L.Control.extend({
    options: {
        position: 'topright',
        layers: null,
        timeAttribute: 'time',
        isEpoch: false,     // whether the time attribute is seconds elapsed from epoch
        startTimeIdx: 0,    // where to start looking for a timestring
        timeStrLength: 19,  // the size of  yyyy-mm-dd hh:mm:ss
        maxValue: -1,
        minValue: 0,
        showAllOnStart: true,
        markers: null,
        range: false,
        follow: false,
        sameDate: false,
        alwaysShowDate : true,
        rezoom: null,
        control: null,
        original_markers: null
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        this._layer = this.options.layer;

    },

    extractTimestamp: function(time, options) {
        if (options.isEpoch) {
            time = (new Date(parseInt(time))).toString(); // this is local time
        }
        return time.substr(options.startTimeIdx, options.startTimeIdx + options.timeStrLength);
    },

    setPosition: function (position) {
        var map = this._map;

        if (map) {
            map.removeControl(this);
        }

        this.options.position = position;

        if (map) {
            map.addControl(this);
        }
        this.startSlider();
        return this;
    },

    onAdd: function (map) {
        this.options.map = map;

        // Create a control sliderContainer with a jquery ui slider
        var sliderContainer = L.DomUtil.create('div', 'slider', this._container);
        $(sliderContainer).append('<div id="leaflet-slider" style="width:200px"><div class="ui-slider-handle"></div><div id="slider-timestamp" style="width:200px; margin-top:13px; background-color:#FFFFFF; text-align:center; border-radius:5px;"></div></div>');
        //Prevent map panning/zooming while using the slider
        $(sliderContainer).mousedown(function () {
            map.dragging.disable();
        });
        $(document).mouseup(function () {
            map.dragging.enable();
            //Hide the slider timestamp if not range and option alwaysShowDate is set on false
            if (options.range || !options.alwaysShowDate) {
                $('#slider-timestamp').html('');
            }
        });

        var options = this.options;
        options.markers = [];
        // create hash to hold all layers
                var layers = [];
                // loop thru all layers in control
                options.control._layers.forEach(function(obj) {
                  // check if layer is an overlay
                  if (obj.overlay) {
                    // store if it's present on the map or not
                    if (options.control._map.hasLayer(obj.layer)){
                        layers.push(obj.layer);
                    }
                  }
                });
                options.markers = [];
                //If a layer has been provided: calculate the min and max values for the slider
                options.layers = layers
                if (options.layers) {
                    var index_temp = 0;
                    options.layers.forEach(function (layer) {
                        layer.eachLayer(function(l){
                            console.log(l)
                            if (l.feature.properties[options.timeAttribute]){
                                options.markers[index_temp] = l;
                                ++index_temp}
                                });
                    });
                    options.maxValue = index_temp - 1;
                    options.markers.sort(function(a, b) {
                      var tempA = a.feature.properties.time
                      var resA = tempA.split(/:| |-/);
                      var tempB = b.feature.properties.time
                      var resB = tempB.split(/:| |-/);
                      var keyA = new Date(parseInt(resA[0]), parseInt(resA[1]), parseInt(resA[2]),
                                          parseInt(resA[3]), parseInt(resA[4]), parseInt(resA[5]))
                      ,
                        keyB = new Date(parseInt(resB[0]), parseInt(resB[1]), parseInt(resB[2]),
                                        parseInt(resB[3]), parseInt(resB[4]), parseInt(resB[5]));
                      // Compare the 2 dates
                      if (keyA < keyB) return -1;
                      if (keyA > keyB) return 1;
                      return 0;
                    });
                    options.original_markers = options.markers
                    this.options = options;
                } else {
                    console.log("Error: External control's map currently has no layers.");
                }
        return sliderContainer;
    },

    onRemove: function (map) {
        //Delete all markers which where added via the slider and remove the slider div
        for (i = this.options.minValue; i <= this.options.maxValue; i++) {
            map.removeLayer(this.options.markers[i]);
        }
        $('#leaflet-slider').remove();

        // unbind listeners to prevent memory leaks
        $(document).off("mouseup");
        $(".slider").off("mousedown");
    },

    startSlider: function () {
        _options = this.options;
        _extractTimestamp = this.extractTimestamp
        var index_start = _options.minValue;
        if(_options.showAllOnStart){
            index_start = _options.maxValue;
            if(_options.range) _options.values = [_options.minValue,_options.maxValue];
            else _options.value = _options.maxValue;
        }
        $("#leaflet-slider").slider({
            range: _options.range,
            value: _options.value,
            values: _options.values,
            min: _options.minValue,
            max: _options.maxValue,
            sameDate: _options.sameDate,
            step: 1,
            start: function (e, ui) {
                // create hash to hold all layers
                var layers = [];
                // loop thru all layers in control
                _options.control._layers.forEach(function(obj) {
                  // check if layer is an overlay
                  if (obj.overlay) {
                    // store whether it's present on the map or not
                    if (_options.control._map.hasLayer(obj.layer))
                    {
                        layers.push(obj.layer);
                    }
                  }
                });
                var old_markers = _options.original_markers;
                _options.markers = [];
                //If a layer has been provided: calculate the min and max values for the slider
                _options.layers = layers
                if (_options.layers) {
                    var index_temp = 0;
                    _options.layers.forEach(function (layer) {
                        layer.eachLayer(function(l){
                        if (l.feature.properties[_options.timeAttribute]){
                                _options.markers[index_temp] = l;
                                ++index_temp}
                                });
                    });
                    _options.markers.sort(function(a, b) {
                      var tempA = a.feature.properties.time
                      var resA = tempA.split(/:| |-/);
                      var tempB = b.feature.properties.time
                      var resB = tempB.split(/:| |-/);
                      var keyA = new Date(parseInt(resA[0]), parseInt(resA[1]), parseInt(resA[2]),
                                          parseInt(resA[3]), parseInt(resA[4]), parseInt(resA[5]))
                      ,
                        keyB = new Date(parseInt(resB[0]), parseInt(resB[1]), parseInt(resB[2]),
                                        parseInt(resB[3]), parseInt(resB[4]), parseInt(resB[5]));
                      // Compare the 2 dates
                      if (keyA < keyB) return -1;
                      if (keyA > keyB) return 1;
                      return 0;
                    });
                    index_temp = 0;
                    temp_markers = []
                    _options.markers.forEach(function (marker)
                    {
                        while (marker.feature !== old_markers[index_temp].feature)
                        {
                            temp_markers[index_temp] = marker.feature.properties.time;
                            ++index_temp;
                        }
                        temp_markers[index_temp] = marker;
                        ++index_temp;
                    });
                    _options.markers = temp_markers
                    _options.maxValue = index_temp - 1;
                    $( "#leaflet-slider" ).slider("option", "max", _options.maxValue);
                } else {
                    console.log("Error: You have to specify a layer via new SliderControl({layer: your_layer});");
                }
            },
            slide: function (e, ui) {
                var map = _options.map;
                var fg = L.featureGroup();
                if(!!_options.markers[ui.value]) {
                    // If there is no time property, this line has to be removed (or exchanged with a different property)
                    if(_options.markers[ui.value].feature !== undefined) {
                        if(_options.markers[ui.value].feature.properties[_options.timeAttribute]){
                            if(_options.markers[ui.value]) $('#slider-timestamp').html(
                                _extractTimestamp(_options.markers[ui.value].feature.properties[_options.timeAttribute], _options));
                        }else {
                            console.error("Time property "+ _options.timeAttribute +" not found in data");
                        }
                    }else {
                        // set by leaflet Vector Layers
                        if(_options.markers[ui.value]){
                            if(_options.markers[ui.value]) $('#slider-timestamp').html(
                                _extractTimestamp(_options.markers[ui.value], _options));
                        }else {
                            console.error("Time property "+ _options.timeAttribute +" not found in data");
                        }
                    }

                    var i;
                    // clear markers
                    for (i = _options.minValue; i <= _options.maxValue; i++) {
                        if(_options.markers[i] && typeof(_options.markers[i]) !== 'string')
                        {
                            map.removeLayer(_options.markers[i]);
                        }
                    }
                    if(_options.range){
                        // jquery ui using range
                        for (i = ui.values[0]; i <= ui.values[1]; i++){
                           if(_options.markers[i] && typeof(_options.markers[i]) !== 'string') {
                               map.addLayer(_options.markers[i]);
                               fg.addLayer(_options.markers[i]);
                           }
                        }
                    }else if(_options.follow){
                        for (i = ui.value - _options.follow + 1; i <= ui.value ; i++) {
                            if(_options.markers[i]) {
                                map.addLayer(_options.markers[i]);
                                fg.addLayer(_options.markers[i]);
                            }
                        }
                    }else if(_options.sameDate){
                        var currentTime;
                        if (_options.markers[ui.value].feature !== undefined) {
                            currentTime = _options.markers[ui.value].feature.properties.time;
                        } else {
                            currentTime = _options.markers[ui.value].options.time;
                        }
                        for (i = _options.minValue; i <= _options.maxValue; i++) {
                            if(_options.markers[i].options.time == currentTime) map.addLayer(_options.markers[i]);
                        }
                    }else{
                        for (i = _options.minValue; i <= ui.value ; i++) {
                            if(_options.markers[i]) {
                                map.addLayer(_options.markers[i]);
                                fg.addLayer(_options.markers[i]);
                            }
                        }
                    }
                };
                if(_options.rezoom) {
                    map.fitBounds(fg.getBounds(), {
                        maxZoom: _options.rezoom
                    });
                }
            }
        });
        if (!_options.range && _options.alwaysShowDate) {
            $('#slider-timestamp').html(_extractTimeStamp(_options.markers[index_start].feature.properties[_options.timeAttribute], _options));
        }
        for (i = _options.minValue; i <= index_start; i++) {
            _options.map.addLayer(_options.markers[i]);
        }
    }
});

L.control.sliderControl = function (options) {
    return new L.Control.SliderControl(options);
};
