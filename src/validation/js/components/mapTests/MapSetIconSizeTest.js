import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {MapSelect} from '../shared';

class MapSetIconSizeTest extends Component {
  constructor(props) {
    super(props);

    var selectedMapId = '';

    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      size: emp3.api.enums.IconSizeEnum.LARGE
    };

    this.setIconSize = this.setIconSize.bind(this);
    this.update = this.update.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  update(event) {
    this.setState({size: event.target.value});
  }

  setIconSize() {
    const map = _.find(this.props.maps, {geoId: this.state.selectedMapId});
    try {

      map.setIconSize(this.state.size);
      toastr.success("Changed IconSize to " + this.state.size);

    } catch(err) {
      toastr.error(err.message, 'Map.setIconSize: Critical');
    }
  }

  render() {
    return (
      <div className='mdl-grid'>
        <span className='mdl-layout-title'>Set IconSize</span>
        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect selectedMapId={this.state.selectedMapId} label='Select Map ' maps={this.props.maps}
                     callback={event => this.setState({selectedMapId: event.target.value})}/>

          <select id='milStdSelect' value={this.state.size} onChange={this.update}>
            <option key={emp3.api.enums.IconSizeEnum.TINY} value={emp3.api.enums.IconSizeEnum.TINY}>TINY</option>;
            <option key={emp3.api.enums.IconSizeEnum.SMALL} value={emp3.api.enums.IconSizeEnum.SMALL}>SMALL</option>;
            <option key={emp3.api.enums.IconSizeEnum.MEDIUM} value={emp3.api.enums.IconSizeEnum.MEDIUM}>MEDIUM</option>;
            <option key={emp3.api.enums.IconSizeEnum.LARGE} value={emp3.api.enums.IconSizeEnum.LARGE}>LARGE</option>;
          </select>
          <br/>
          <br/>
          <button className='mdl-button mdl-js-button mdl-js--ripple-effect mdl-button--raised mdl-button--colored'
                  onClick={this.setIconSize} disabled={this.state.selectedMapId === ''}>
            Set
          </button>

          <RelatedTests relatedTests={[
            {text: 'Map.getIconSize', target: 'mapGetIconSizeTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

MapSetIconSizeTest.propTypes = {
  maps: PropTypes.array.isRequired
};

export default MapSetIconSizeTest;
