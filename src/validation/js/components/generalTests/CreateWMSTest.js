import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {VText, VCheckBox, MapSelect, VSelect} from '../shared';
import {WMSVERSION} from '../../constants';

class CreateWMSTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      name: '',
      geoId: '',
      url: 'https://worldwind25.arc.nasa.gov/wms',
      description: '',
      layers: 'earthatnight',
      tileFormat: 'image/png',
      transparent: true,
      availableLayers: [],
      selectedLayers: [],
      useProxy: false,
      wmsVersion: 'WMS' // this translates to undefined.  I had to hack this
                        // a little because VSelect does not allow me to specify
                        // numbers as my value.
    };

    this.updateSelectedMapId = this.updateSelectedMapId.bind(this);
    this.updateWMS = this.updateWMS.bind(this);
    this.createWMSAddToMap = this.createWMSAddToMap.bind(this);
    this.createWMS = this.createWMS.bind(this);
    this.updateWMSUrl = this.updateWMSUrl.bind(this);
    this.getLayers = this.getLayers.bind(this);
    this.parseCapabilities = _.debounce(this.parseCapabilities.bind(this), 1000);
    this.updateLayers = this.updateLayers.bind(this);
    this.toggleLayer = this.toggleLayer.bind(this);
  }

  componentDidMount() {
    this.parseCapabilities();
  }

  componentDidUpdate() {
    componentHandler.upgradeDom();
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMapId(event) {
    this.setState({
      selectedMapId: event.target.value
    });
  }

  updateWMSUrl(event) {
    this.setState({url: event.target.value}, () => {
      if (this.state.url !== '') {
        this.parseCapabilities();
      }
    });
  }

  updateWMS(event) {
    let prop = event.target.id.split('-')[1],
      newState = {...this.state};

    if (prop === 'transparent' ||
      prop === 'useProxy') {
      newState[prop] = event.target.checked;
    } else {
      newState[prop] = event.target.value;
    }

    if (prop === "url") {
      this.setState(newState, _.debounce(this.parseCapabilities, 2000));
    } else {
      this.setState(newState);
    }
  }

  parseCapabilities() {
    $.get(this.state.url.trim() + '?request=GetCapabilities&service=WMS')
      .done(data => {
        let xml = $(data);
        let root = xml.find('WMS_Capabilities');
        this.setState({availableLayers: this.getLayers(root)});
        toastr.success('Received Layer Information');
      })
      .fail(() => {
        toastr.error('Failed to Find Layer Information');
        this.setState({availableLayers: []});
      });
  }

  getLayers(root) {
    const layers = [];
    root.find('Layer').each(function() {
      if ($(this).children('Name').text() !== '') {
        layers.push({
          title: $(this).children('Title').text(),
          name: $(this).children('Name').text()
        });
      }
    });
    return layers;
  }

  updateLayers(event) {
    let layers = event.target.value.split(',');

    this.setState({
      layers: event.target.value,
      selectedLayers: layers
    });
  }

  toggleLayer(event) {
    function formatArray(selectedLayers) {
      let layerString = JSON.stringify(selectedLayers);
      layerString = layerString.replace(/\"/g, '');
      layerString = layerString.replace(/\[|\]/g, '');
      return layerString;
    }

    let newLayers;
    if (event.target.checked) {
      newLayers = [...this.state.selectedLayers, event.target.value];
    } else {
      newLayers = [...this.state.selectedLayers];
      _.pull(newLayers, event.target.value);
    }

    setTimeout(this.setState({
      selectedLayers: newLayers,
      layers: formatArray(newLayers)
    }), 50);
  }

  createWMS() {
    let name = (this.state.name !== '') ? this.state.name : undefined,
      geoId = (this.state.geoId !== '') ? this.state.geoId : undefined,
      description = (this.state.description !== '') ? this.state.description : undefined,
      url = (this.state.url !== '') ? this.state.url : undefined,
      layers = (this.state.layers !== '') ? this.state.layers : undefined,
      transparent = this.state.transparent,
      tileFormat = (this.state.tileFormat !== '') ? this.state.tileFormat : undefined,
      wmsVersion = (this.state.wmsVersion !== '') ? this.state.wmsVersion : undefined,
      wms;

    // Translate the values in the selection box to be the actual values
    // of the wms version enumeration.  If the value is just WMS, that is
    // considered undefined.
    if (wmsVersion && wmsVersion !== '') {
      wmsVersion = wmsVersion.replace(/_/g, '.');
      wmsVersion = wmsVersion.replace('WMS', '');
      if (wmsVersion === '') {
        wmsVersion = undefined;
      }
    } else {
      wmsVersion = undefined;
    }

    wms = new emp3.api.WMS({
      name: name,
      geoId: geoId,
      url: url,
      layers: layers,
      transparent: transparent,
      tileFormat: tileFormat,
      wmsVersion: wmsVersion,
      description: description,
      useProxy: this.state.useProxy
    });

    this.props.addMapService(wms);

    if (wms) {
      toastr.success('WMS ' + name + ' added successfully');
    } else {
      toastr.error('WMS ' + name + ' creation failed');
    }

    return wms;
  }

  createWMSAddToMap() {

    const wms = this.createWMS();
    const selectedMap = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    if (!selectedMap) {
      toastr.error('Could not find specified map', 'Create Overlay Add To Map');
    } else {
      try {
        selectedMap.addMapService({
          mapService: wms,
          onSuccess: (args) => {
            toastr.success('Added WMS To Map \n' + JSON.stringify(args));
          },
          onError: err => {
            this.addError(err, 'map.addOverlay');
            toastr.error('Failed to Add Overlay To Map');
          }
        });
      } catch (err) {
        this.addError(err.message, 'createWMSAddToMap:Critical');
        toastr.error(err.message, 'Create WMS Add To Map:Critical');
      }
    }
  }

  render() {
    return (
      <div className="mdl-grid">
        <span className="mdl-layout-title">Create a WMS Service</span>

        <div className="mdl-cell mdl-cell--12-col">
          <MapSelect id='createWMS-mapSelect' label='Choose which map to add the service to'
                     selectedMapId={this.state.selectedMapId} callback={this.updateSelectedMapId}/>
        </div>

        <VText id='createWMS-name'
               className="mdl-cell mdl-cell--12-col"
               value={this.state.name}
               label='Name'
               callback={this.updateWMS}/>

        <VText id='createWMS-geoId'
               className="mdl-cell mdl-cell--12-col"
               value={this.state.geoId}
               label='GeoID'
               callback={this.updateWMS}/>

        <VText id='createWMS-url'
               className="mdl-cell mdl-cell--12-col"
               value={this.state.url}
               label='URL'
               callback={this.updateWMS}/>

        <VText id='createWMS-layers'
               className="mdl-cell mdl-cell--12-col"
               value={this.state.layers}
               label='Layers'
               callback={this.updateLayers}/>

        <div className="mdl-cell mdl-cell--12-col">
          <span className="mdl-layout-title">Available Layers</span>
          <ul id='availableLayersList' style={{listStyle: 'none'}}>
            {this.state.availableLayers.length === 0 ? <li>No Layers Available</li> : null}
            {this.state.availableLayers.map((layer, i) => {
              if (i > 50) {
                return; // TODO paginate the results
              }
              let checked = _.includes(this.state.selectedLayers, layer.name);
              return (
                <li key={layer.name}>
                  <label className='mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect' htmlFor={layer.name}>
                    <input type='checkbox' id={layer.name} className='mdl-checkbox__input' value={layer.name}
                           onChange={this.toggleLayer} checked={checked}/>
                    <span className='mdl-checkbox__label'>{layer.name}</span>
                    <span style={{fontSize: '0.8em', fontStyle: 'oblique'}}> {layer.title}</span>
                  </label>
                </li>);
            })}
          </ul>
        </div>

        <VText id='createWMS-tileFormat'
               className="mdl-cell mdl-cell--12-col"
               value={this.state.tileFormat}
               label='Format'
               callback={this.updateWMS}/>

        <VCheckBox id='createWMS-transparent'
                   className="mdl-cell mdl-cell--12-col"
                   label='Transparent'
                   checked={this.state.transparent}
                   callback={this.updateWMS}/>

        <VSelect id='createWMS-wmsVersion'
                 label='WMS Version'
                 values={WMSVERSION}
                 value={this.state.wmsVersion}
                 callback={this.updateWMS}/>

        <VText id='createWMS-description'
               className="mdl-cell mdl-cell--12-col"
               value={this.state.description}
               label='Description'
               callback={this.updateWMS}/>

        <VCheckBox id='createWMS-useProxy'
                   className="mdl-cell mdl-cell--12-col"
                   label='Use Proxy'
                   checked={this.state.useProxy}
                   callback={this.updateWMS}/>

        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
          onClick={this.createWMS}>
          Create WMS
        </button>

        <button
          className='mdl-button mdl-js-button  mdl-button--raised mdl-button--colored mdl-js-ripple-effect mdl-cell mdl-cell--12-col'
          onClick={this.createWMSAddToMap}
          disabled={this.props.maps.length === 0}>
          Add WMS
        </button>

        <RelatedTests relatedTests={[
          {text: 'Add a Map Service', target: 'mapAddMapServiceTest'},
          {text: 'Remove a Map Service', target: 'mapRemoveMapServiceTest'},
          {text: 'Create a KML link', target: 'createKMLLayerTest'},
          {text: 'Create a WMTS Service', target: 'createWMTSTest'}
        ]}/>
      </div>
    );
  }
}

CreateWMSTest.propTypes = {
  maps: PropTypes.array.isRequired,
  mapServices: PropTypes.array.isRequired,
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  addMapService: PropTypes.func.isRequired
};

export default CreateWMSTest;
