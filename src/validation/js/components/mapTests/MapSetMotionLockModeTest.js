import React, {Component, PropTypes} from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import {RelatedTests} from '../../containers';

class MapSetMotionLockModeTest extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId
    };

    this.setLockState = this.setLockState.bind(this);
  }

  componentWillReceiveProps(props) {
    if (this.state.selectedMapId === '' && props.maps.length > 0) {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  setLockState(lockState) {
    const {maps} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});

    try {
      map.setMotionLockMode({mode: lockState});
      toastr.info('Set Lock State to ' + lockState);
    } catch (err) {
      toastr.error(err.message, 'map.setMotionLockMode: Critical');
    }
  }


  render() {
    const {maps} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>map.setMotionLockMode</span>
        <div className='mdl-grid'>

          <DropdownList
            data={maps}
            className='mdl-cell mdl-cell--12-col'
            textField='container'
            valueField='geoId'
            value={this.state.selectedMapId}
            onChange={map => this.setState({selectedMapId: map.geoId})}/>

          {_.map(emp3.api.enums.MapMotionLockEnum, (value, key) => {
            return (
              <button
                key={key}
                className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
                disabled={this.state.selectedMapId === ''}
                onClick={this.setLockState.bind(this, value)}>
                {_.replace(key, /_/g, " ")}
              </button>);
          })}

          <RelatedTests relatedTests={[]}/>
        </div>
      </div>
    );
  }
}

MapSetMotionLockModeTest.propTypes = {
  maps: PropTypes.array
};

export default MapSetMotionLockModeTest;
