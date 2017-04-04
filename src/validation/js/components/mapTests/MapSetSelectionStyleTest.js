import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {VText, MapSelect} from '../shared';

class MapSetSelectionStyleTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      color: "",
      scale: ""
    };

    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.update = this.update.bind(this);
    this.setStyle = this.setStyle.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMap(event) {
    this.setState({selectedMapId: event.target.value});
  }

  update(event) {
    if (event.target.id === "mapSelectStyle-color") {
      this.setState({
        color: event.target.value
      });
    } else if (event.target.id === "mapSelectStyle-scale") {
      this.setState({
        scale: event.target.value
      });
    }
  }

  setStyle() {
    const {maps} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});

    try {
      map.setSelectionStyle({
        color: this.state.color,
        scale: this.state.scale
      });
    } catch (err) {
      toastr.error(err.message);
    }
  }

  render() {
    const {maps} = this.props;

    return (
      <div className='mdl-layout'>
        <span className="mdl-layout-title">Select the Selection Style</span>

        <div className="mdl-cell mdl-cell--12-col">
          <MapSelect label='Map'
                     maps={maps}
                     selectedMapId={this.state.selectedMapId}
                     callback={this.updateSelectedMap}/>
        </div>


        <VText id='mapSelectStyle-color'
               className="mdl-cell mdl-cell--12-col"
               label='color'
               value={this.state.color}
               callback={this.update}/>

        <VText id='mapSelectStyle-scale'
               className="mdl-cell mdl-cell--12-col"
               label='scale'
               value={this.state.scale}
               callback={this.update}/>

        <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
                onClick={this.setStyle}
                disabled={this.state.selectedMapId === ''}>
          Change Style
        </button>

        <RelatedTests relatedTests={[
          {text: 'Select Feature', target: 'mapSelectFeatureTest'},
          {text: 'Select Features', target: 'mapSelectFeaturesTest'},
          {text: 'Deselect Feature', target: 'mapDeselectFeatureTest'},
          {text: 'Deselect Features', target: 'mapDeselectFeaturesTest'},
          {text: 'Clear Selection', target: 'mapClearSelectedTest'},
          {text: 'Get Selected Features', target: 'mapGetSelectedTest'},
          {text: 'Check Features for Selection', target: 'mapIsSelectedTest'}
        ]}/>
      </div>
    );
  }
}

MapSetSelectionStyleTest.propTypes = {
  maps: PropTypes.array
};

export default MapSetSelectionStyleTest;
