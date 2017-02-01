import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapMilStdLabelsTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      labels: emp3.api.enums.MilStdLabelSettingEnum.ALL_LABELS
    };

    this.setMilStdLabels = this.setMilStdLabels.bind(this);
    this.update = this.update.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  update(event) {
    this.setState({labels: event.target.value});
  }

  setMilStdLabels() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {

      map.setMilStdLabels(this.state.labels);
      toastr.success("Changed MilStdLabels to " + this.state.labels);

    } catch(err) {
      toastr.error(err.message, 'Map.setMilStdLabels: Critical');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Set MilStdLabels</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>

          <select id='milStdSelect' value={this.state.iconSize} onChange={this.update}>
            <option key={emp3.api.enums.MilStdLabelSettingEnum.ALL_LABELS} value={emp3.api.enums.MilStdLabelSettingEnum.ALL_LABELS}>ALL LABELS</option>;
            <option key={emp3.api.enums.MilStdLabelSettingEnum.COMMON_LABELS} value={emp3.api.enums.MilStdLabelSettingEnum.COMMON_LABELS}>COMMON LABELS</option>;
            <option key={emp3.api.enums.MilStdLabelSettingEnum.REQUIRED_LABELS} value={emp3.api.enums.MilStdLabelSettingEnum.REQUIRED_LABELS}>REQUIRED_LABELS</option>;
          </select>
          <br/>
          <br/>

          <button className='mdl-button mdl-js-button mdl-js--ripple-effect mdl-button--raised mdl-button--colored'
                  onClick={this.setMilStdLabels} disabled={this.state.selectedMapId === ''}>
            Set
          </button>

          <RelatedTests relatedTests={[
            {text: 'Map.getMilStdLabels', target: 'mapGetMilStdLabelsTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapMilStdLabelsTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapMilStdLabelsTest;
