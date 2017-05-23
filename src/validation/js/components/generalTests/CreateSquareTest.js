import React, {Component, PropTypes} from 'react';
import assign from 'object-assign';
import RelatedTests from '../../containers/RelatedTests';
import {OverlaySelect, VText} from '../shared';
import PropertiesBox from '../shared/PropertiesBox';

class CreateSquareTest extends Component {

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
        position: '',
        width: '',
        description: ''
      },
      selectedOverlayId: selectedOverlayId
    };

    this.updateFeature = this.updateFeature.bind(this);
    this.createSquareFeature = this.createSquareFeature.bind(this);
    this.updateProperties = this.updateProperties.bind(this);
    this.createSquareAddToOverlay = this.createSquareAddToOverlay.bind(this);
    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
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
    let prop = event.target.id.split('-')[1];
    let feature = {...this.state.feature};
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
  createSquareFeature(silent) {
    const {addFeature, addResult, addError} = this.props;
    let args = {...this.state.feature};

    let position = this.state.feature.position.split(',');

    args.name = this.state.feature.name.trim() === '' ? undefined : this.state.feature.name.trim();
    args.geoId = this.state.feature.geoId.trim() === '' ? undefined : this.state.feature.geoId.trim();
    args.position = {
      longitude: position[0] ? parseFloat(position[0]) : undefined,
      latitude: position[1] ? parseFloat(position[1]) : undefined,
      altitude: position[2] ? parseFloat(position[2]) : undefined
    };
    args.width = this.state.feature.width === '' ? undefined : parseFloat(this.state.feature.width);

    let square;
    try {
      if ( !_.find(this.props.features, {geoId: this.state.feature.geoId}))
      { // create only when feature not found in core
      square = new emp3.api.Square(args);
      addResult(args, 'createSquareFeature');
      addFeature(square);
      if (!silent) {
        toastr.success('Square Created Successfully');
      }
    }
    } catch (err) {
      addError(err.message, 'createSquareFeature');
      if (!silent) {
        toastr.error(err.message, 'Create Square Failed');
      }
      throw new Error(err.message);
    }
    return square;
  }

  createSquareAddToOverlay() {
    const {overlays, addResult, addError} = this.props;
    if (this.state.selectedOverlayId === '') {
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});
    try {
      const square = this.createSquareFeature(true);
      if (square)
      {
      overlay.addFeatures({
        features: [square],
        onSuccess: () => {
          addResult(square, 'createSquareAddToOverlay');
          toastr.success('Square Added To Overlay at ' + JSON.stringify(square.position) + ' ' + square.width);
        },
        onError: (err) => {
          addError(err, 'createSquareAddToOverlay');
          toastr.error('Square Add To Overlay Failed');
        }
      });
    }
    } catch (err) {
      addError(err.message, 'createSquareAddToOverlay:Critical');
      toastr.error(err.message, 'Square Add To Overlay: Critical');
    }
  }

  apply() {
    const {features} = this.props;
    let square = _.find(features, {geoId: this.state.feature.geoId});
    if (!square) {
      toastr.error('No square found with the given id ' + this.state.feature.geoId);
      return;
    }

    let position = this.state.feature.position.split(',');

    try {
      square = assign(square, {}, this.state.feature,
        {
          position: {
            longitude: position[0] ? parseFloat(position[0]) : square.position.longitude,
            latitude: position[1] ? parseFloat(position[1]) : square.position.latitude,
            altitude: position[2] ? parseFloat(position[2]) : square.position.altitude
          }
        },
        {width: parseFloat(this.state.feature.width)}
      );
      square.apply();
    } catch (err) {
      toastr.error(err.message, 'Square.apply: Critical');
    }
  }

  render() {
    const {overlays} = this.props;
    return (
      <div>
        <span className='mdl-layout-title'>Create a Square</span>
        <div className='mdl-grid'>

          <VText id='createSquare-name'
                 className="mdl-cell mdl-cell--12-col"
                 label='Name'
                 value={this.state.feature.name}
                 callback={this.updateFeature}/>

          <VText id='createSquare-geoId'
                 className="mdl-cell mdl-cell--12-col"
                 label='GeoID'
                 value={this.state.feature.geoId}
                 callback={this.updateFeature}/>

          <VText id="createSquare-position"
                 className="mdl-cell mdl-cell--12-col"
                 label="position (lon,lat,alt)"
                 value={this.state.feature.position}
                 callback={this.updateFeature}/>

          <VText id='createSquare-width'
                 className="mdl-cell mdl-cell--12-col"
                 label='Width'
                 value={this.state.feature.width}
                 callback={this.updateFeature}/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.createSquareFeature(false)}>
            Create Square
          </button>

          <OverlaySelect id='overlay-select'
                         className="mdl-cell mdl-cell--12-col"
                         overlays={overlays}
                         selectedOverlayId={this.state.selectedOverlayId}
                         callback={this.updateSelectedOverlay}
                         label='Select which overlay to attach the square to '/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createSquareAddToOverlay}
            disabled={overlays.length === 0}>
            Add To Overlay
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.apply}>
            Update
          </button>

          <div id='createSquare-properties' className='mdl-cell mdl-cell--12-col mdl-grid'>
            <h3>Properties</h3>
            <VText id='createSquare-description'
                   className="mdl-cell mdl-cell--12-col"
                   label='Description'
                   value={this.state.description}/>

            <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEO_SQUARE} callback={this.updateProperties}
                           properties={this.state.feature}/>
          </div>

          <RelatedTests relatedTests={[
            {text: 'Create an overlay', target: 'createOverlayTest'},
            {text: 'Add this feature to an overlay'},
            {text: 'Add this feature to another feature'}
          ]}/>
        </div>
      </div>)
      ;
  }
}

CreateSquareTest.propTypes = {
  overlays: PropTypes.array,
  features: PropTypes.array,
  addError: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired
};

export default CreateSquareTest;
