import React, {Component, PropTypes} from 'react';
import assign from 'object-assign';
import {OverlaySelect, VText} from '../shared';
import RelatedTests from '../../containers/RelatedTests';
import PropertiesBox from '../shared/PropertiesBox';

class CreateRectangleTest extends Component {

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
        height: '',
        width: '',
        position: ''
      },
      selectedOverlayId: selectedOverlayId
    };

    this.updateFeature = this.updateFeature.bind(this);
    this.createRectangleFeature = this.createRectangleFeature.bind(this);
    this.createRectangleAddToOverlay = this.createRectangleAddToOverlay.bind(this);
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
    toastr.info(JSON.stringify(event));
    this.setState({selectedOverlayId: event.target.value});
  }

  updateFeature(event) {
    let prop = event.target.id.split('-')[1],
      feature = {...this.state.feature};
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
  createRectangleFeature(silent) {
    const {addFeature, addResult, addError} = this.props;
    let position = this.state.feature.position.split(',');
    let args = {...this.state.feature};

    args.name = this.state.feature.name === '' ? undefined : this.state.feature.name.trim();
    args.geoId = this.state.feature.geoId === '' ? undefined : this.state.feature.geoId.trim();
    args.height = this.state.feature.height === '' ? undefined : parseFloat(this.state.feature.height);
    args.width = this.state.feature.width === '' ? undefined : parseFloat(this.state.feature.width);
    args.position = {
      longitude: position[0] ? parseFloat(position[0]) : undefined,
      latitude: position[1] ? parseFloat(position[1]) : undefined,
      altitude: position[2] ? parseFloat(position[2]) : undefined
    };

    let rectangle;
    try {
      if ( !_.find(this.props.features, {geoId: this.state.feature.geoId}))
      { // create only when feature not found in core
      rectangle = new emp3.api.Rectangle(args);
      addResult(args, 'createRectangle');
      addFeature(rectangle);
      if (!silent) {
        toastr.success('Create Rectangle Success');
      }
    }
    } catch (err) {
      addError(err, 'createRectangle');
      if (!silent) {
        toastr.error(err.message, 'Create Rectangle');
      }
      throw new Error(err.message);
    }
    return rectangle;
  }

  createRectangleAddToOverlay() {
    const {addError, addResult, overlays} = this.props;
    if (this.state.selectedOverlayId === '') {
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});
    try {
      const rectangle = this.createRectangleFeature();
      if (rectangle)
      {
      overlay.addFeatures({
        features: [rectangle],
        onSuccess: () => {
          addResult(rectangle, 'createRectangleAddToOverlay');
          toastr.success('Rectangle Added To Overlay at ' + JSON.stringify(rectangle.position));
        },
        onError: (err) => {
          addError(err, 'createRectangleAddToOverlay');
          toastr.error('Rectangle Add To Overlay Failed');
        }
      });
    }
    } catch (err) {
      addError(err.message, 'createRectangleAddToOverlay:Critical');
      toastr.error(err.message, 'Create Rectangle Add To Overlay: Critical');
    }
  }

  apply() {
    const {features} = this.props;
    let rectangle = _.find(features, {geoId: this.state.feature.geoId});
    if (!rectangle) {
      toastr.error('No rectangle found with the given id ' + this.state.feature.geoId);
      return;
    }

    let position = this.state.feature.position.split(',');
    try {
      rectangle = assign(rectangle, {}, this.state.feature,
        {
          position: {
            longitude: position[0] ? parseFloat(position[0]) : undefined,
            latitude: position[1] ? parseFloat(position[1]) : undefined,
            altitude: position[2] ? parseFloat(position[2]) : undefined
          }
        },
        {height: parseFloat(this.state.feature.height)},
        {width: parseFloat(this.state.feature.width)}
      );
      rectangle.apply();
    } catch (err) {
      toastr.error(err.message, 'Rectangle.apply: Critical');
    }
  }

  render() {
    const {overlays} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Create a Rectangle</span>
        <div className='mdl-grid'>
          <VText id='createRectangle-name'
                 className="mdl-cell mdl-cell--12-col"
                 label='Name'
                 value={this.state.feature.name}
                 callback={this.updateFeature}/>

          <VText id='createRectangle-geoId'
                 className="mdl-cell mdl-cell--12-col"
                 label='GeoId'
                 value={this.state.feature.geoId}
                 callback={this.updateFeature}/>

          <VText id="createRectangle-position"
                 className="mdl-cell mdl-cell--12-col"
                 label="position (lon,lat,alt)"
                 value={this.state.feature.position}
                 callback={this.updateFeature}/>

          <VText id='createRectangle-width'
                 value={this.state.feature.width}
                 callback={this.updateFeature}
                 label='Width'
                 className="mdl-cell mdl-cell--6-col"/>

          <VText id='createRectangle-height'
                 value={this.state.feature.height}
                 callback={this.updateFeature}
                 label='Height'
                 className="mdl-cell mdl-cell--6-col"/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createRectangleFeature}>
            Create Rectangle
          </button>

          <OverlaySelect id='overlay-select'
                         className="mdl-cell mdl-cell--12-col"
                         overlays={overlays}
                         selectedOverlayId={this.state.selectedOverlayId}
                         callback={this.updateSelectedOverlay}
                         label='Select which overlay to attach the rectangle to '/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createRectangleAddToOverlay}
            disabled={overlays.length === 0}>
            Create Rectangle Add To Overlay
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.apply}>
            Update
          </button>

          <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE}
                         callback={this.updateProperties}
                         properties={this.state.feature}/>

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

CreateRectangleTest.propTypes = {
  overlays: PropTypes.array,
  features: PropTypes.array,
  addError: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired
};

export default CreateRectangleTest;
