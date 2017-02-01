import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {VText, VCheckBox, MapSelect} from '../shared';

class CreateKMLLayerTest extends Component {
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
      url: 'https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml',
      description: '',
      kmlString: '',
      useProxy: false
    };

    this.updateSelectedMapId = this.updateSelectedMapId.bind(this);
    this.updateKMLLayer = this.updateKMLLayer.bind(this);
    this.createKMLLayerAddToMap = this.createKMLLayerAddToMap.bind(this);
    this.createKMLLayer = this.createKMLLayer.bind(this);
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

  updateKMLLayer(event) {
    switch(event.target.id) {
      case 'createKMLLayer-name':
        this.setState({
          name: event.target.value
        });
        break;
      case 'createKMLLayer-geoId':
        this.setState({
          geoId: event.target.value
        });
        break;
      case 'createKMLLayer-url':
        this.setState({
          url: event.target.value
        });
        break;
      case 'createKMLLayer-description':
        this.setState({
          description: event.target.value
        });
        break;
      case 'createKMLLayer-kmlString':
        this.setState({
          kmlString: event.target.value
        });
        break;
      case 'createKMLLayer-useProxy':
        this.setState({
          useProxy: event.target.checked
        });
        break;
    }
  }

  createKMLLayer() {
    let name = (this.state.name !== '') ? this.state.name : undefined,
        geoId = (this.state.geoId !== '') ? this.state.geoId : undefined,
        description = (this.state.description !== '') ? this.state.description : undefined,
        url = (this.state.url !== '') ? this.state.url : undefined,
        kmlString = (this.state.kmlString !== '') ? this.state.kmlString : undefined,
        kmlLayer;

    kmlLayer = new emp3.api.KMLLayer({
      name: name,
      geoId: geoId,
      url: url,
      description: description,
      kmlString: kmlString,
      useProxy: this.state.useProxy
    });

    this.props.addMapService(kmlLayer);

    if (kmlLayer) {
      toastr.success('KML Layer ' + name + ' added succesfully');
    } else {
      toastr.error('KML Layer ' + name + ' creation failed');
    }

    return kmlLayer;
  }

  createKMLLayerAddToMap() {
    const kmlLayer = this.createKMLLayer();
    const selectedMap = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    if (!selectedMap) {
      toastr.error('Could not find specified map', 'Create Overlay Add To Map');
    } else {
      try {
        selectedMap.addMapService({
          mapService: kmlLayer,
          onSuccess: (args) => {
            toastr.success('Added KML Layer To Map \n' + JSON.stringify(args));
          },
          onError: () => {
            toastr.error('Failed to Add Overlay To Map');
          }
        });
      } catch (err) {
        toastr.error(err.message, 'Create KML Layer Add To Map:Critcal');
      }
    }
  }

  render() {
    return (
      <div>
        <h3>Create a KML Layer</h3>
        <MapSelect id='createKMLLayer-mapSelect' label='Choose which map to add the KML Layer to' selectedMapId={this.state.selectedMapId} callback={this.updateSelectedMapId}/>
        <VText id='createKMLLayer-geoId' value={this.state.geoId} label='GeoID' callback={this.updateKMLLayer}/>
        <VText id='createKMLLayer-name' value={this.state.name} label='Name' callback={this.updateKMLLayer}/>
        <VText id='createKMLLayer-description' value={this.state.description} label='Description' callback={this.updateKMLLayer}/>
        <VText id='createKMLLayer-url' value={this.state.url} label='URL' callback={this.updateKMLLayer}/>
        <VText id='createKMLLayer-kmlString'
               value={this.state.kmlString}
               rows={10}
               callback={this.updateKMLLayer}
               label='Place KML string Here'
               classes={['mdl-cell', 'mdl-cell--12-col']}/>
        <VCheckBox id='createKMLLayer-useProxy' label='Use Proxy' checked={this.state.useProxy} callback={this.updateKMLLayer}
               classes={['mdl-cell', 'mdl-cell--12-col']}/>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.createKMLLayer}>
          Create KML Layer
        </button>

        <button
          className='blocky addButton mdl-button mdl-js-button  mdl-button--raised mdl-button--colored mdl-js-ripple-effect'
          onClick={this.createKMLLayerAddToMap} disabled={this.props.maps.length === 0}>
          Add KML Layer
        </button>

        <RelatedTests relatedTests={[
          {text: 'Add a Map Service', target: 'mapAddMapServiceTest'},
          {text: 'Remove a Map Service', target: 'mapRemoveMapServiceTest'},
          {text: 'Create a WMS Service', target: 'createWMSTest'},
          {text: 'Create a WMTS Service', target: 'createWMTSTest'}
        ]}/>
      </div>
    );
  }
}

CreateKMLLayerTest.propTypes = {
  maps: PropTypes.array.isRequired,
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  addMapService: PropTypes.func.isRequired
};

export default CreateKMLLayerTest;
