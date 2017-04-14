import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import assign from 'object-assign';
import {OverlaySelect, PropertiesBox, VText} from '../shared';
import RelatedTests from '../../containers/RelatedTests';

class CreateKMLTest extends Component {

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
        KMLString: ''
      },
      selectedOverlayId: selectedOverlayId,
      featureProps: {}
    };

    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.createKML = this.createKML.bind(this);
    this.createKMLAddToOverlay = this.createKMLAddToOverlay.bind(this);
    this.updateKML = this.updateKML.bind(this);
    this.updateKMLProperties = this.updateKMLProperties.bind(this);
    this.apply = this.apply.bind(this);
  }

  componentDidMount() {
    $.ajax('resources/KML_samples.kml').then((xmlDoc) => {
      let newFeature = {...this.state.feature};
      newFeature.KMLString = new XMLSerializer().serializeToString(xmlDoc);
      this.setState({feature: newFeature});
    });
  }

  componentDidUpdate() {
    componentHandler.upgradeDom();
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  updateKML(ev) {
    let prop = ev.target.id.split('-')[1],
      feature = {...this.state.feature};

    feature[prop] = ev.target.value;
    this.setState({feature: feature});
  }

  updateKMLProperties(propertyName, value) {
    const newFeatureProperties = {...this.state.featureProps};
    newFeatureProperties[propertyName] = value;

    this.setState({featureProps: newFeatureProperties});
  }

  updateSelectedOverlay(ev) {
    this.setState({selectedOverlayId: ev.target.value});
  }

  /**
   * @param {boolean} silent will not display toastr message if set true
   * @throws Will throw an error if KML Feature constructor fails
   */
  createKML(silent) {
    const {addFeature, addResult, addError} = this.props;
    let KMLFeature;
    let args = {...this.state.feature};

    args.name = this.state.feature.name.trim() === '' ? undefined : this.state.feature.name.trim();
    args.geoId = this.state.feature.geoId.trim() === '' ? undefined : this.state.feature.geoId.trim();
    args.KMLString = this.state.feature.KMLString.trim() === '' ? undefined : this.state.feature.KMLString.trim();
    args.properties = {...this.state.featureProps};

    try {
      KMLFeature = new emp3.api.KML(args);
      addResult(args, 'createKML');
      addFeature(KMLFeature);
      if (!silent) {
        toastr.success('KMLFeature created successfully', 'createKML');
      }
    } catch (err) {
      addError(err.message, 'createKML');
      if (!silent) {
        toastr.error(err.message, 'createKML');
      }
      throw new Error(err.message);
    }
    return KMLFeature;
  }

  createKMLAddToOverlay() {
    const {overlays, addError, addResult} = this.props;
    if (this.state.selectedOverlayId === '') {
      toastr.warning('No overlay selected');
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});

    try {
      const KMLFeature = this.createKML(true);
      overlay.addFeatures({
        features: [KMLFeature],
        onSuccess: () => {
          addResult(KMLFeature, 'createKMLAddToOverlay');
          toastr.success('KML Added To Overlay');
        },
        onError: (err) => {
          addError(err, 'createKMLAddToOverlay');
          toastr.error('KML Add To Overlay Failed');
        }
      });
    } catch (err) {
      addError(err.message, 'createKMLAddToOverlay:Critical');
      toastr.error(err.message, 'createKMLAddToOverlay: Critical');
    }
  }

  apply() {
    const {features} = this.props;
    let KMLFeature = _.find(features, {geoId: this.state.feature.geoId});
    if (!KMLFeature) {
      toastr.error('No KMLFeature found with the given id ' + this.state.feature.geoId);
      return;
    }

    try {
      KMLFeature = assign(KMLFeature, {}, this.state.featureProps,
        {name: this.state.feature.name},
        {properties: this.state.featureProps},
        {KMLString: this.state.feature.KMLString}
      );
      KMLFeature.apply();
    } catch (err) {
      toastr.error(err.message, 'KMLFeature.apply: Critical');
    }
  }

  render() {
    const {overlays} = this.props;

    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Create a KML</span>

        <VText id='createKML-name'
               value={this.state.feature.name}
               callback={this.updateKML}
               label='Name'
               className='mdl-cell mdl-cell--12-col'/>

        <VText id='createKML-geoId'
               value={this.state.feature.geoId}
               callback={this.updateKML}
               label='GeoId'
               className='mdl-cell mdl-cell--12-col'/>

        <VText id='createKML-KMLString'
               value={this.state.feature.KMLString}
               rows={10}
               callback={this.updateKML}
               label='Place KML string Here'
               className='mdl-cell mdl-cell--12-col'/>

        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
          onClick={this.createKML}>
          Create KML
        </button>

        <OverlaySelect id="selectedOverlay"
                       className='mdl-cell mdl-cell--12-col'
                       overlays={overlays}
                       label='Select which overlay to add to'
                       selectedOverlayId={this.state.selectedOverlayId}
                       callback={this.updateSelectedOverlay}/>

        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
          onClick={this.createKMLAddToOverlay}
          disabled={overlays.length === 0}>
          Create KML Add To Overlay
        </button>

        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
          onClick={this.apply}>
          Update
        </button>

        <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.KML}
                       callback={this.updateKMLProperties}
                       properties={this.state.featureProps}/>

        <RelatedTests relatedTests={[
          {text: 'Create an Overlay', target: 'createOverlayTest'},
          {text: 'Add this feature to an overlay'},
          {text: 'Add this feature to another feature'},
          {text: 'Delete a feature', target: 'deleteFeaturesTest'}
        ]}/>
      </div>
    );
  }
}

CreateKMLTest.propTypes = {
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

export default connect(mapStateToProps)(CreateKMLTest);
