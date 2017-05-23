import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import assign from 'object-assign';
import {OverlaySelect, PropertiesBox, VText} from '../shared';
import RelatedTests from '../../containers/RelatedTests';

class CreateGeoJSONTest extends Component {

  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }
    this.state = {
      feature: {
        name: '',
        geoId: '',
        geojsonString: ''
      },
      selectedOverlayId: selectedOverlayId,
      featureProps: {}
    };

    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.createGeoJSON = this.createGeoJSON.bind(this);
    this.createGeoJSONAddToOverlay = this.createGeoJSONAddToOverlay.bind(this);
    this.updateGeoJSON = this.updateGeoJSON.bind(this);
    this.updateGeoJSONProperties = this.updateGeoJSONProperties.bind(this);
    this.apply = this.apply.bind(this);
  }

  componentDidUpdate() {
    componentHandler.upgradeDom();
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  updateGeoJSON(ev) {
    let prop = ev.target.id.split('-')[1],
        feature = {...this.state.feature};


    if (prop === "geojsonString") {
      this.setState({geojsonString: ev.target.value});
    } else {
      feature[prop] = ev.target.value;
      this.setState({feature: feature});
    }

  }

  updateGeoJSONProperties(propertyName, value) {
    const newFeatureProperties = {...this.state.featureProps};

    newFeatureProperties[propertyName] = value;
    this.setState({featureProps: newFeatureProperties});
  }

  updateSelectedOverlay(ev) {
    this.setState({selectedOverlayId: ev.target.value});
  }

  /**
   * @param {boolean} silent will not display toastr message if set true
   * @throws Will throw an error if GeoJSON Feature constructor fails
   */
  createGeoJSON(silent) {
    const {addFeature, addResult, addError} = this.props;
    let GeoJSONFeature;
    let args = {...this.state.feature};

    args.name = this.state.feature.name.trim() === '' ? undefined : this.state.feature.name.trim();
    args.geoId = this.state.feature.geoId.trim() === '' ? undefined : this.state.feature.geoId.trim();
    try {
      args.GeoJSONData = JSON.parse(this.state.geojsonString);
    } catch (e) {
      toastr.error("Could not parse GeoJSON");
    }

    args.properties = {...this.state.featureProps};

    try {
      if ( !_.find(this.props.features, {geoId: this.state.feature.geoId}))
      { // create only when feature not found in core
      GeoJSONFeature = new emp3.api.GeoJSON(args);
      addResult(args, 'createGeoJSON');
      addFeature(GeoJSONFeature);
      if (!silent) {
        toastr.success('GeoJSONFeature created successfully', 'createGeoJSON');
      }
    }
    } catch (err) {
      addError(err.message, 'createGeoJSON');
      if (!silent) {
        toastr.error(err.message, 'createGeoJSON');
      }
      throw new Error(err.message);
    }
    return GeoJSONFeature;
  }

  createGeoJSONAddToOverlay() {
    const {overlays, addError, addResult} = this.props;
    if (this.state.selectedOverlayId === '') {
      toastr.warning('No overlay selected');
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});

    try {
      const GeoJSONFeature = this.createGeoJSON(true);
      overlay.addFeatures({
        features: [GeoJSONFeature],
        onSuccess: () => {
          addResult(GeoJSONFeature, 'createGeoJSONAddToOverlay');
          toastr.success('GeoJSON Added To Overlay');
        },
        onError: (err) => {
          addError(err, 'createGeoJSONAddToOverlay');
          toastr.error('GeoJSON Add To Overlay Failed');
        }
      });
    } catch (err) {
      addError(err.message, 'createGeoJSONAddToOverlay:Critical');
      toastr.error(err.message, 'createGeoJSONAddToOverlay: Critical');
    }
  }

  apply() {
    const {features} = this.props;
    let GeoJSONFeature = _.find(features, {geoId: this.state.feature.geoId});
    if (!GeoJSONFeature) {
      toastr.error('No GeoJSONFeature found with the given id ' + this.state.feature.geoId);
      return;
    }

    try {
      GeoJSONFeature = assign(GeoJSONFeature, {}, this.state.featureProps,
        {name: this.state.feature.name},
        {properties: this.state.featureProps},
        {GeoJSONData: JSON.parse(this.state.geojsonString)}
      );
      GeoJSONFeature.apply();
    } catch (err) {
      toastr.error(err.message, 'GeoJSONFeature.apply: Critical');
    }
  }

  render() {
    const {overlays} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Create a GeoJSON</span>
        <div className='mdl-grid'>

          <VText id='createGeoJSON-name'
                 value={this.state.feature.name}
                 callback={this.updateGeoJSON}
                 label='Name'
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='createGeoJSON-geoId'
                 value={this.state.feature.geoId}
                 callback={this.updateGeoJSON}
                 label='GeoId'
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='createGeoJSON-geojsonString'
                 value={this.state.geojsonString}
                 rows='10'
                 callback={this.updateGeoJSON}
                 label='Place GeoJSON string here'
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <button className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col' onClick={this.createGeoJSON}>
            Create GeoJSON
          </button>

          <div className='mdl-cell mdl-cell--12-col'>
            <OverlaySelect id="selectedOverlay"
                           overlays={overlays}
                           label='Select which overlay to add to'
                           selectedOverlayId={this.state.selectedOverlayId}
                           callback={this.updateSelectedOverlay}/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createGeoJSONAddToOverlay}
            disabled={overlays.length === 0}>
            Create GeoJSON Add To Overlay
          </button>


          <button className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col' onClick={this.apply}>
            Update
          </button>

          <div id='createGeoJSON-properties' className='mdl-cell mdl-cell--12-col mdl-grid'>
            <h3>Properties</h3>
            <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEOJSON} callback={this.updateGeoJSONProperties}
                           properties={this.state.featureProps}/>
          </div>

          <RelatedTests relatedTests={[
            {text: 'Create an Overlay', target: 'createOverlayTest'},
            {text: 'Add this feature to an overlay'},
            {text: 'Add this feature to another feature'},
            {text: 'Delete a feature', target: 'deleteFeaturesTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

CreateGeoJSONTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired,
  overlays: PropTypes.array,
  features: PropTypes.array
};

const mapStateToProps = state => {
  return {
    overlays: state.overlays,
    features: state.features
  };
};

export default connect(mapStateToProps)(CreateGeoJSONTest);
