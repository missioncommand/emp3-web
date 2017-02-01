import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import RelatedTests from '../../containers/RelatedTests';
import {PropertiesBox, OverlaySelect, VText} from '../shared';
import assign from 'object-assign';

class CreateCircleTest extends Component {
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
        description: '',
        position: '',
        radius: ''
      },
      selectedOverlayId: selectedOverlayId
    };

    this.updateFeature = this.updateFeature.bind(this);
    this.updateProperties = this.updateProperties.bind(this);
    this.createCircle = this.createCircle.bind(this);
    this.createCircleAddToOverlay = this.createCircleAddToOverlay.bind(this);
    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.apply = this.apply.bind(this);
  }

  /**
   * React lifecycle function
   */
  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  /**
   * React lifecycle function
   */
  updateSelectedOverlay(event) {
    this.setState({selectedOverlayId: event.target.value});
  }

  /**
   * Handles updates from this form
   * @param event
   */
  updateFeature(event) {
    const prop = event.target.id.split('-')[1],
      feature = {...this.state.feature};

    feature[prop] = event.target.value;
    this.setState({feature: feature});
  }

  /**
   * Handles updates from the properties box
   * @param propertyName
   * @param value
   */
  updateProperties(propertyName, value) {
    const feature = {...this.state.feature};
    feature[propertyName] = value;
    this.setState({feature: feature});
  }

  /**
   * Runs the emp3.api.Circle constructor
   * @param silent
   * @return emp3.api.Circle
   */
  createCircle(silent) {
    const {addResult, addError, addFeature} = this.props;
    let circle,
      featureArgs = {...this.state.feature};

    featureArgs.name = this.state.feature.name.trim() === '' ? undefined : this.state.feature.name.trim();
    featureArgs.geoId = this.state.feature.geoId.trim() === '' ? undefined : this.state.feature.geoId.trim();
    featureArgs.description = this.state.feature.description.trim() === '' ? undefined : this.state.feature.geoId.trim();

    let position = this.state.feature.position.split(',');
    featureArgs.position = {
      longitude: isNaN(position[0]) ? undefined : parseFloat(position[0]),
      latitude: isNaN(position[1]) ? undefined : parseFloat(position[1]),
      altitude: isNaN(position[2]) ? undefined : parseFloat(position[2])
    };

    featureArgs.radius = isNaN(this.state.feature.radius) ? undefined : parseFloat(this.state.feature.radius);

    try {
      circle = new emp3.api.Circle(featureArgs);
      addResult(featureArgs, 'createCircle');
      addFeature(circle);
      if (!silent) {
        toastr.success('Circle Created Successfully');
      }

    } catch (err) {
      addError(err.message, 'createCircle');
      if (!silent) {
        toastr.error(err.message, 'Create Circle Failed');
      }
      throw new Error(err.message);
    }
    return circle;
  }

  createCircleAddToOverlay() {
    const {overlays, addResult, addError} = this.props;
    if (this.state.selectedOverlayId === '') {
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});
    try {
      const circle = this.createCircle(true);
      overlay.addFeatures({
        features: [circle],
        onSuccess: () => {
          addResult(circle, 'createCircleAddToOverlay');
          toastr.success('Circle Added To Overlay at ' + JSON.stringify(circle.position));
        },
        onError: (err) => {
          addError(err, 'createCircleAddToOverlay');
          toastr.error('Circle Add To Overlay Failed');
        }
      });
    } catch (err) {
      addError(err.message, 'createCircleAddToOverlay:Critical');
      toastr.error(err.message, 'Circle Add To Overlay: Critical');
    }
  }

  /**
   * Takes the changes made to the form and attempts to apply them to the circle
   */
  apply() {
    const {features} = this.props;
    let circle = _.find(features, {geoId: this.state.feature.geoId});
    if (!circle) {
      toastr.error('No circle found with the given id ' + this.state.feature.geoId);
      return;
    }

    try {
      let position = this.state.feature.position.split(',');
      position = {
        longitude: isNaN(position[0]) ? undefined : parseFloat(position[0]),
        latitude: isNaN(position[1]) ? undefined : parseFloat(position[1]),
        altitude: isNaN(position[2]) ? undefined : parseFloat(position[2])
      };

      let radius = isNaN(this.state.feature.radius) ? undefined : parseFloat(this.state.feature.radius);

      circle = assign(circle, {},
        this.state.feature,
        {position: position},
        {radius: radius}
      );

      circle.apply();
    } catch (err) {
      toastr.error(err.message, 'Create Circle Add To Overlay:Critical');
    }
  }

  /**
   * React Lifecycle function
   */
  render() {
    const {maps, overlays} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Create a Circle</span>
        <div className='mdl-grid'>
          <VText
            id='createCircle-name'
            label='name'
            className='mdl-cell mdl-cell--12-col'
            callback={this.updateFeature}
            value={this.state.feature.name}/>

          <VText
            id='createCircle-geoId'
            label='geoId'
            className='mdl-cell mdl-cell--12-col'
            callback={this.updateFeature}
            value={this.state.feature.geoId}/>

          <VText
            id='createCircle-description'
            label='description'
            className='mdl-cell mdl-cell--12-col'
            callback={this.updateFeature}
            value={this.state.feature.description}/>

          <VText
            id='createCircle-position'
            label='coords (lon,lat,alt)'
            className='mdl-cell mdl-cell--8-col'
            callback={this.updateFeature}
            value={this.state.feature.position}/>

          <VText
            id='createCircle-radius'
            label='radius'
            className='mdl-cell mdl-cell--4-col'
            callback={this.updateFeature}
            value={this.state.feature.radius}/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createCircle}>
            Create Circle
          </button>

          <OverlaySelect
            id='overlay-select'
            className='mdl-cell mdl-cell--12-col'
            overlays={overlays}
            label='Select which overlay to attach the circle to'
            selectedOverlayId={this.state.selectedOverlayId}
            callback={this.updateSelectedOverlay}/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createCircleAddToOverlay}
            disabled={!maps.length}>
            Create Circle Add To Overlay
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.apply}>
            Update
          </button>

          <div id='createCircle-properties' className='mdl-cell mdl-cell--12-col'>
            <h3>Properties</h3>
            <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
                           callback={this.updateProperties}
                           properties={this.state.feature}/>
          </div>

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

CreateCircleTest.propTypes = {
  maps: PropTypes.array,
  overlays: PropTypes.array,
  features: PropTypes.array,
  addError: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    features: state.features,
    overlays: state.overlays,
    maps: state.maps
  };
};

export default connect(mapStateToProps)(CreateCircleTest);
