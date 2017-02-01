import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {VText, OverlaySelect, PropertiesBox} from '../shared';
import assign from 'object-assign';

class CreateTextTest extends Component {

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
        position: ''
      },
      selectedOverlayId: selectedOverlayId
    };

    this.updateFeature = this.updateFeature.bind(this);
    this.createText = this.createText.bind(this);
    this.createTextAddToOverlay = this.createTextAddToOverlay.bind(this);
    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.updateProperties = this.updateProperties.bind(this);
    this.apply = this.apply.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  updateSelectedOverlay(event) {
    this.setState({selectedOverlayId: event.target.value});
  }

  updateFeature(event) {
    let feature = {...this.state.feature},
      prop = event.target.id.split('-')[1];
    feature[prop] = event.target.value;
    this.setState({feature: feature});
  }

  updateProperties(propertyName, value) {
    const feature = {...this.state.feature};
    feature[propertyName] = value;
    this.setState({feature: feature});
  }

  /**
   * @param {boolean} silent will not display toastr message if set true
   * @throws Will throw an error if primitive constructor fails
   */
  createText(silent) {
    const {addResult, addFeature, addError} = this.props;
    let args = {...this.state.feature};

    args.name = this.state.feature.name.trim() === '' ? undefined : this.state.feature.name.trim();
    args.geoId = this.state.feature.geoId.trim() === '' ? undefined : this.state.feature.geoId.trim();
    let position = this.state.feature.position.split(',');
    args.position = new emp3.api.GeoPosition({
      longitude: position[0] === '' ? undefined : parseFloat(position[0]),
      latitude: position[1] === '' ? undefined : parseFloat(position[1]),
      altitude: position[2] === '' ? undefined : parseFloat(position[2])
    });

    let text;
    try {
      text = new emp3.api.Text(args);
      addResult(args, 'createText');
      addFeature(text);
      if (!silent) {
        toastr.success('Text created Successfully');
      }
    } catch (err) {
      addError(err.message, 'createText');
      if (!silent) {
        toastr.error(err.message, 'Create Text Failed');
      }
      throw new Error(err.message);
    }

    return text;
  }

  createTextAddToOverlay() {
    const {addResult, addError, overlays} = this.props;

    if (this.state.selectedOverlayId === '') {
      toastr.warning('No overlay selected');
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});

    try {
      const text = this.createText(true);
      overlay.addFeatures({
        features: [text],
        onSuccess: () => {
          addResult(text, 'createTextAddToOverlay');
          toastr.success('Text Added To Overlay at ' + JSON.stringify(text.position));
        },
        onError: (err) => {
          addError(err, 'createTextAddToOverlay');
          toastr.error('Text Add To Overlay Failed');
        }
      });
    } catch (err) {
      addError(err.message, 'createTextAddToOverlay: Critical');
      toastr.error(err.message, 'Create Text Add To Overlay: Critical');
    }
  }

  apply() {
    const {features} = this.props;
    let text = _.find(features, {geoId: this.state.feature.geoId});
    if (!text) {
      toastr.error('No text found with the given id ' + this.state.feature.geoId);
      return;
    }

    try {
      let position = this.state.feature.position.split(',');
      let geoPosition = new emp3.api.GeoPosition({
        longitude: position[0] === '' ? undefined : parseFloat(position[0]),
        latitude: position[1] === '' ? undefined : parseFloat(position[1]),
        altitude: position[2] === '' ? undefined : parseFloat(position[2])
      });

      text = assign(text, {}, this.state.feature,
        {position: geoPosition}
      );
      text.apply();
    } catch (err) {
      toastr.error(err.message, 'Text.apply: Critical');
    }
  }

  render() {
    const {overlays, maps} = this.props;
    return (
      <div>
        <span className='mdl-layout-title'>Create a Text</span>
        <div className='mdl-grid'>
          <VText id='text-name'
                 label='name'
                 value={this.state.feature.name}
                 callback={this.updateFeature}
                 className='mdl-cell mdl-cell--12-col'/>

          <VText id='text-geoId'
                 label='geoId'
                 value={this.state.feature.geoId}
                 callback={this.updateFeature}
                 className='mdl-cell mdl-cell--12-col'/>

          <VText id='text-position'
                 label='position (lon,lat,alt)'
                 value={this.state.feature.position}
                 callback={this.updateFeature}
                 className='mdl-cell mdl-cell--12-col'/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.createText(false)}>
            Create Text
          </button>

          <div className='mdl-cell mdl-cell--12-col'>
            <OverlaySelect
              overlays={overlays}
              callback={this.updateSelectedOverlay}
              selectedOverlayId={this.state.selectedOverlayId}
              label='Select overlay to attach text to '/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createTextAddToOverlay} disabled={maps.length === 0}>
            Create Text Add To Overlay
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.apply}>
            Update
          </button>

          <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEO_TEXT}
                         callback={this.updateProperties}
                         properties={this.state.featureProps}/>

          <RelatedTests relatedTests={[
            {text: 'Create an overlay', target: 'createOverlayTest'},
            {text: 'Add this feature to an overlay'},
            {text: 'Add this feature to another feature'}
          ]}/>
        </div>
      </div>
    );
  }
}

CreateTextTest.propTypes = {
  maps: PropTypes.array,
  overlays: PropTypes.array,
  features: PropTypes.array,
  addError: PropTypes.func,
  addResult: PropTypes.func,
  addFeature: PropTypes.func
};

export default CreateTextTest;
