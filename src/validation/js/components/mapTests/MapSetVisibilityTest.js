import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import DropdownList from 'react-widgets/lib/DropdownList';

class MapSetVisibilityTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    // Convert the enum into an array the DropdownList can handle
    this.visibilityActions = _.map(emp3.api.enums.VisibilityActionEnum, (value, text) => {
      return {text:text, value:value};
     });

    this.state = {
      selectedMapId: selectedMapId,
      visibilityAction: emp3.api.enums.VisibilityActionEnum.HIDE_ALL,
      selectedFeatures: [],
      selectedOverlays: []
    };

    this.toggleFeature = this.toggleFeature.bind(this);
    this.toggleOverlay = this.toggleOverlay.bind(this);
    this.setVisibility = this.setVisibility.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  toggleFeature(event) {
    let selectedFeatures = [...this.state.selectedFeatures];
    if (event.target.checked) {
      selectedFeatures.push(event.target.id);
    } else {
      _.pull(selectedFeatures, event.target.id);
    }
    setTimeout(this.setState({selectedFeatures: selectedFeatures}), 25);
  }

  toggleOverlay(event) {
    let selectedOverlays = [...this.state.selectedOverlays];
    if (event.target.checked) {
      selectedOverlays.push(event.target.id);
    } else {
      _.pull(selectedOverlays, event.target.id);
    }
    setTimeout(this.setState({selectedOverlays: selectedOverlays}), 25);
  }

  setVisibility() {
    const {maps, features, overlays, addResult, addError} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});

    let target;

    if (this.state.selectedFeatures.length + this.state.selectedOverlays.length > 1) {
      target = [];
      if (this.state.selectedFeatures.length > 0) {
        for (let feature of this.state.selectedFeatures) {
          target.push(_.find(features, {geoId: feature}));
        }
      } else if (this.state.selectedOverlays.length > 0) {
        for (let overlay of this.state.selectedOverlays) {
          target.push(_.find(overlays, {geoId: overlay}));
        }
      }
    } else {
      if (this.state.selectedFeatures.length > 0) {
        target = _.find(features, {geoId: _.first(this.state.selectedFeatures)});
      } else if (this.state.selectedOverlays.length > 0) {
        target = _.find(overlays, {geoId: _.first(this.state.selectedOverlays)});
      }
    }

    try {
      map.setVisibility({
        target: target,
        action: this.state.visibilityAction,
        parent: undefined,
        onSuccess: cbArgs => {
          addResult(cbArgs, 'Map.setVisibility');
          toastr.success('Set Visibility Successfully');
        },
        onError: err => {
          addError(err, 'Map.setVisibility');
          toastr.error('Failed Setting Visibility');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.setVisibility: Critical');
      addError(err.message, 'Map.setVisibility: Critical');
    }
  }

  render() {
    const {maps, overlays, features} = this.props;

    const featuresList = <div style={{maxHeight: '500px', overflowY: 'auto'}}>
      <ul style={{listDisplay: 'none', margin: 0, padding: 0}}>
        {features.map((feature, i) => {
          if (i > 50) {
            return null;
          }
          return (
            <li key={feature.geoId}>
              <label className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" htmlFor={feature.geoId}>
                <input type="checkbox" id={feature.geoId} className="mdl-checkbox__input"
                       onChange={this.toggleFeature} checked={_.includes(this.state.selectedFeatures, feature.geoId)}/>
                <span className="mdl-checkbox__label" style={{fontSize: '0.9em'}}>{feature.geoId}</span>
              </label>
            </li>);
        })}
      </ul>
    </div>;

    const overlaysList = <div style={{maxHeight: '500px', overflowY: 'auto'}}>
      <ul style={{listDisplay: 'none', margin: 0, padding: 0}}>
        {overlays.map((overlay, i) => {
          if (i > 50) {
            return null;
          }
          return (
            <li key={overlay.geoId}>
              <label className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" htmlFor={overlay.geoId}>
                <input type="checkbox" id={overlay.geoId} className="mdl-checkbox__input"
                       onChange={this.toggleOverlay} checked={_.includes(this.state.selectedOverlays, overlay.geoId)}/>
                <span className="mdl-checkbox__label">{overlay.name}</span>
              </label>
            </li>);
        })}
      </ul>
    </div>;

    return (
      <div>
        <span className='mdl-layout-title'>Set Visibility</span>
        <div className='mdl-grid'>

          <DropdownList
            className='mdl-cell mdl-cell--12-col'
            data={maps}
            textField='container' valueField='geoId'
            value={this.state.selectedMapId}
            onChange={map => this.setState({selectedMapId: map.geoId})}/>

          <div id='overlays' className='mdl-cell mdl-cell--12-col'>
            <h5>Overlays</h5>
            {overlaysList}
          </div>

          <div id='features' className='mdl-cell mdl-cell--12-col'>
            <h5>Features</h5>
            {featuresList}
          </div>

          <DropdownList
            className='mdl-cell mdl-cell--12-col'
            data={this.visibilityActions}
            textField='text' valueField='value'
            value={this.state.visibilityAction}
            onChange={entry => this.setState({visibilityAction: entry.value})}/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.setVisibility}
            disabled={maps.length === 0}>
            Set Visibility
          </button>

          <RelatedTests relatedTests={[
            {text: 'Create an Overlay', target: 'createOverlayTest'},
            {text: 'Create a Circle'},
            {text: 'Create an Ellipse'},
            {text: 'Create a Path', target: 'createPathTest'},
            {text: 'Create a Polygon', target: 'createPolygonTest'},
            {text: 'Create a Symbol', target: 'createMilStdSymbolTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapSetVisibilityTest.propTypes = {
  maps: PropTypes.array.isRequired,
  overlays: PropTypes.array.isRequired,
  features: PropTypes.array.isRequired,
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired
};

export default MapSetVisibilityTest;
