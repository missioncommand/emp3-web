import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import assign from 'object-assign';
import RelatedTests from '../../containers/RelatedTests';
import {PropertiesBox, OverlaySelect, VText} from '../shared';

class CreateEllipseTest extends Component {

  constructor(props) {
    super(props);

    let selectedOverlayId = '';

    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }

    this.state = {
      selectedOverlayId: selectedOverlayId,
      feature: {
        name: '',
        geoId: '',
        position: '',
        semiMajor: '',
        semiMinor: '',
        description: ''
      }
    };

    this.updateFeature = this.updateFeature.bind(this);
    this.createEllipse = this.createEllipse.bind(this);
    this.updateProperties = this.updateProperties.bind(this);
    this.createEllipseAddToOverlay = this.createEllipseAddToOverlay.bind(this);
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
  createEllipse(silent) {
    const {addResult, addFeature, addError} = this.props;
    let args = {...this.state.feature};

    args.name = this.state.feature.name.trim() === '' ? undefined : this.state.feature.name.trim();
    args.geoId = this.state.feature.geoId.trim() === '' ? undefined : this.state.feature.geoId.trim();
    args.description = this.state.feature.description.trim() === '' ? undefined : this.state.feature.geoId.trim();
    let position = this.state.feature.position.split(',');
    args.position = {
      longitude: position[0] === '' ? undefined : parseFloat(position[0]),
      latitude: position[1] === '' ? undefined : parseFloat(position[1]),
      altitude: position[2] === '' ? undefined : parseFloat(position[2])
    };
    args.semiMajor = this.state.feature.semiMajor === '' ? undefined : parseFloat(this.state.feature.semiMajor);
    args.semiMinor = this.state.feature.semiMinor === '' ? undefined : parseFloat(this.state.feature.semiMinor);

    let ellipse;
    try {
      ellipse = new emp3.api.Ellipse(args);
      addResult(args, 'createEllipse');
      addFeature(ellipse);
      if (!silent) {
        toastr.success('Ellipse Created Successfully');
      }
    } catch (err) {
      addError(err.message, 'createEllipse');
      if (!silent) {
        toastr.error(err.message, 'Create Ellipse Failed');
      }
      throw new Error(err.message);
    }
    return ellipse;
  }

  createEllipseAddToOverlay() {
    const {overlays, addResult, addError} = this.props;
    if (this.state.selectedOverlayId === '') {
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});
    try {
      const ellipse = this.createEllipse(true);
      overlay.addFeatures({
        features: [ellipse],
        onSuccess: () => {
          addResult(ellipse, 'createEllipseAddToOverlay');
          toastr.success('Ellipse Added To Overlay at ' + JSON.stringify(ellipse.position));
        },
        onError: (err) => {
          addError(err, 'createEllipseAddToOverlay');
          toastr.error('Ellipse Add To Overlay Failed');
        }
      });
    } catch (err) {
      addError(err.message, 'createEllipseAddToOverlay:Critical');
      toastr.error(err.message, 'Ellipse Add To Overlay: Critical');
    }
  }

  apply() {
    const {features} = this.props;
    let ellipse = _.find(features, {geoId: this.state.feature.geoId});
    if (!ellipse) {
      toastr.error('No ellipse found with the given id ' + this.state.feature.geoId);
      return;
    }

    try {
      let position = this.state.feature.position.split(',');

      ellipse = assign(ellipse, {}, this.state.feature,
        {
          position: {
            longitude: position[0] === '' ? undefined : parseFloat(position[0]),
            latitude: position[1] === '' ? undefined : parseFloat(position[1]),
            altitude: position[2] === '' ? undefined : parseFloat(position[2])
          }
        },
        {semiMajor: this.state.feature.semiMajor === '' ? undefined : parseFloat(this.state.feature.semiMajor)},
        {semiMinor: this.state.feature.semiMinor === '' ? undefined : parseFloat(this.state.feature.semiMinor)}
      );
      ellipse.apply();
    } catch (err) {
      toastr.error(err.message, 'Update Ellipse: Critical');
    }
  }

  render() {
    const {maps, overlays} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Create an Ellipse</span>
        <div className='mdl-grid'>
          <VText id='createEllipse-name'
                 label='name'
                 callback={this.updateFeature}
                 value={this.state.feature.name}
                 className="mdl-cell mdl-cell--12-col"/>

          <VText id='createEllipse-geoId'
                 label='geoId'
                 callback={this.updateFeature}
                 value={this.state.feature.geoId}
                 className="mdl-cell mdl-cell--12-col"/>

          <VText id='createEllipse-description'
                 label='description'
                 callback={this.updateFeature}
                 value={this.state.feature.description}
                 className="mdl-cell mdl-cell--12-col"/>

          <VText id='createEllipse-position'
                 label='position (lon,lat,alt)'
                 callback={this.updateFeature}
                 className="mdl-cell mdl-cell--12-col"
                 value={this.state.feature.position}/>

          <VText id='createEllipse-semiMajor'
                 label='semiMajor'
                 callback={this.updateFeature}
                 className="mdl-cell mdl-cell--6-col"
                 value={this.state.feature.semiMajor}/>

          <VText id='createEllipse-semiMinor'
                 label='semiMinor'
                 callback={this.updateFeature}
                 className="mdl-cell mdl-cell--6-col"
                 value={this.state.feature.semiMinor}/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createEllipse}>
            Create Ellipse
          </button>

          <div className='mdl-cell mdl-cell--12-col'>
            <OverlaySelect id='overlay-select'
                           overlays={overlays}
                           label='Select which overlay to attach the ellipse to'
                           selectedOverlayId={this.state.selectedOverlayId}
                           callback={this.updateSelectedOverlay}/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createEllipseAddToOverlay}
            disabled={maps.length === 0}>
            Create Ellipse Add To Overlay
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.apply}>
            Update
          </button>

          <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}
                         callback={this.updateProperties}
                         properties={this.state.feature}/>

          <RelatedTests className='mdl-cell mdl-cell--12-col' relatedTests={[
            {text: 'Create an overlay', target: 'createOverlayTest'},
            {text: 'Add this feature to an overlay'},
            {text: 'Add this feature to another feature'}
          ]}/>
        </div>
      </div>
    );
  }
}

CreateEllipseTest.propTypes = {
  maps: PropTypes.array,
  overlays: PropTypes.array,
  features: PropTypes.array,
  addError: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    maps: state.maps,
    overlays: state.overlays,
    features: state.features
  };
};

export default connect(mapStateToProps)(CreateEllipseTest);
