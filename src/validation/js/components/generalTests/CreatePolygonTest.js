import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import assign from 'object-assign';
import {OverlaySelect, PropertiesBox, VText} from '../shared';
import RelatedTests from '../../containers/RelatedTests';
import {createRandomPositionsKML, convertPositionStringToGeoPositions} from '../../util/LocationGen.js';

class CreatePolygonTest extends Component {

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
        positions: ''
      },
      selectedOverlayId: selectedOverlayId
    };

    this.updatePositionsWithRandom = this.updatePositionsWithRandom.bind(this);
    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.createPolygon = this.createPolygon.bind(this);
    this.createPolygonAddToOverlay = this.createPolygonAddToOverlay.bind(this);
    this.updatePolygon = this.updatePolygon.bind(this);
    this.updatePolygonProperties = this.updatePolygonProperties.bind(this);
    this.apply = this.apply.bind(this);
  }

  updatePositionsWithRandom() {
    let feature = {...this.state.feature};
    feature.positions = createRandomPositionsKML(3);
    this.setState({feature: feature});
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  updatePolygon(ev) {
    let prop = ev.target.id.split('-')[1],
      feature = {...this.state.feature};

    feature[prop] = ev.target.value;
    this.setState({feature: feature});
  }

  updatePolygonProperties(propertyName, value) {
    const feature = {...this.state.feature};
    feature[propertyName] = value;

    this.setState({feature: feature});
  }

  updateSelectedOverlay(ev) {
    this.setState({selectedOverlayId: ev.target.value});
  }

  /**
   * @param {boolean} silent will not display toastr message if set true
   * @throws Will throw an error if primitive constructor fails
   */
  createPolygon(silent) {
    const {addFeature, addResult, addError} = this.props;
    let polygon;

    let args = {...this.state.feature};
    args.name = this.state.feature.name.trim() === '' ? undefined : this.state.feature.name.trim();
    args.geoId = this.state.feature.geoId.trim() === '' ? undefined : this.state.feature.geoId.trim();
    args.positions = convertPositionStringToGeoPositions(this.state.feature.positions);

    try {
      if ( !_.find(this.props.features, {geoId: this.state.feature.geoId}))
      { // create only when feature not found in core
      polygon = new emp3.api.Polygon(args);
      addResult(args, 'Create Polygon');
      addFeature(polygon);
      if (!silent) {
        toastr.success('Polygon created successfully', 'Create Polygon');
      }
    }
    } catch (err) {
      addError(err.message, 'createPolygon');
      if (!silent) {
        toastr.error(err.message, 'Create Polygon');
      }
      throw new Error(err.message);
    }
    return polygon;
  }

  createPolygonAddToOverlay() {
    const {overlays, addError, addResult} = this.props;
    if (this.state.selectedOverlayId === '') {
      toastr.warning('No overlay selected');
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});

    try {
      const polygon = this.createPolygon(true);
      overlay.addFeatures({
        features: [polygon],
        onSuccess: () => {
          addResult(polygon, 'createPolygonAddToOverlay');
          toastr.success('Polygon Added To Overlay at ' + JSON.stringify(polygon.positions[0]));
        },
        onError: (err) => {
          addError(err, 'createPolygonAddToOverlay');
          toastr.error('Polygon Add To Overlay Failed');
        }
      });
    } catch (err) {
      addError(err.message, 'createPolygonAddToOverlay:Critical');
      toastr.error(err.message, 'Create Polygon Add To Overlay: Critical');
    }
  }

  apply() {
    const {features} = this.props;
    let polygon = _.find(features, {geoId: this.state.feature.geoId});
    if (!polygon) {
      toastr.error('No polygon found with the given id ' + this.state.feature.geoId);
      return;
    }

    try {
      polygon = assign(polygon, {}, this.state.feature,
        {positions: convertPositionStringToGeoPositions(this.state.feature.positions)}
      );
      polygon.apply();
    } catch (err) {
      toastr.error(err.message, 'Polygon.apply: Critical');
    }
  }

  render() {
    const {overlays} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Create a Polygon</span>
        <div className='mdl-grid'>

          <VText id='createPolygon-name'
                 value={this.state.feature.name}
                 callback={this.updatePolygon}
                 label='Name'
                 className="mdl-cell mdl-cell--12-col"/>

          <VText id='createPolygon-geoId'
                 value={this.state.feature.geoId}
                 callback={this.updatePolygon}
                 label='geoId'
                 className="mdl-cell mdl-cell--12-col"/>

          <VText id='createPolygon-positions'
                 className="mdl-cell mdl-cell--9-col"
                 value={this.state.feature.positions}
                 callback={this.updatePolygon}
                 label='Positions'/>

          <button className='mdl-button mdl-js-button mdl-button--icon mdl-button--colored mdl-cell mdl-cell--1-col'
                  onClick={this.updatePositionsWithRandom} title='Generate random position'>
            <i className='material-icons'>+</i>
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createPolygon}>
            Create Polygon
          </button>

          <OverlaySelect id="selectedOverlay"
                         className="mdl-cell mdl-cell--12-col"
                         overlays={overlays}
                         label='Select which overlay to add to'
                         selectedOverlayId={this.state.selectedOverlayId}
                         callback={this.updateSelectedOverlay}/>
          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createPolygonAddToOverlay}
            disabled={overlays.length === 0}>
            Create Polygon Add To Overlay
          </button>


          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.apply}>
            Update
          </button>

          <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEO_POLYGON}
                         callback={this.updatePolygonProperties} properties={this.state.feature}/>

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

CreatePolygonTest.propTypes = {
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

export default connect(mapStateToProps)(CreatePolygonTest);
