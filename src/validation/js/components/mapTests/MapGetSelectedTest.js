import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapGetSelectedTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      selectedFeatures: []
    };

    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.getSelected = this.getSelected.bind(this);


  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  componentDidMount() {
    if (this.state.selecteMapId != "") {
      this.getSelected(this.state.selectedMapId);
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value}, () => {
      this.getSelected(event.target.value);
    });
  }

  getSelected(selectedMapId) {
    const map = _.find(this.props.maps, {geoId: selectedMapId});

    if (map) {
      var features = map.getSelected();
      this.setState({selectedFeatures: features});
      toastr.success('Feature selected successfully: \n' + JSON.stringify(features));
    } else {
      toastr.error("Cannot find map");
    }
  }

  render() {

    return (
      <div className='mdl-layout'>
        <h3>Get Selected Features</h3>

        <MapSelect label='Map'
                  selectedMapId={this.state.selectedMapId}
                  callback={this.updateSelectedMap}/>


        <h5>Selected Features</h5>
        <ul className='mdl-list' style={{maxHeight: '500px', overflowY:'auto'}}>
          {this.state.selectedFeatures.map(feature => {
            return (
            <li key={feature.geoId} className='mdl-list__item mdl-list__item--two-line'>
              <span className='mdl-list__item-primary-content'>
                  {feature.name}
                  <span className='mdl-list__item-sub-title'>{feature.geoId}</span>
              </span>
            </li>);
          })}
          {this.state.selectedFeatures.length === 0 ? <li className='mdl-list__item'>
            <span className='mdl-list__item-primary-content'>No Selected Features</span>
          </li> : null}
        </ul>

        <RelatedTests relatedTests={[
          {text: 'Select Feature', target:'mapSelectFeatureTest'},
          {text: 'Select Features', target:'mapSelectFeaturesTest'},
          {text: 'Deselect Feature', target:'mapDeselectFeatureTest'},
          {text: 'Deselect Features', target:'mapDeselectFeaturesTest'},
          {text: 'Check Features for Selection', target:'mapIsSelectedTest'}
        ]}/>
      </div>
    );
  }
}

MapGetSelectedTest.propTypes = {
  maps: PropTypes.array.isRequired,
  features: PropTypes.array.isRequired
};

export default MapGetSelectedTest;
