import React, {Component,PropTypes} from 'react';
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
      selectedMapId: selectedMapId,
      lockMode: emp3.api.enums.MapMotionLockEnum.NO_MOTION
    };

    this.lockMap = this.lockMap.bind(this);
    this.unlockMap = this.unlockMap.bind(this);
  }

  lockMap() {
    const {maps} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});

    try {
      map.setMotionLockMode({mode: this.state.lockMode});
      toastr.info('Locking ' + map.container);
    } catch (err) {
      toastr.error(err.message, 'map.setMotionLockMode: Critical');
    }
  }

  unlockMap() {
    const {maps} = this.props;
    const map = _.find(maps, {geoId: this.state.selectedMapId});

    try {
      map.setMotionLockMode({mode: emp3.api.enums.MapMotionLockEnum.UNLOCKED});
      toastr.info('Unlocking ' + map.container);
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

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            disabled={this.state.selectedMapId === ''}
            onClick={this.lockMap}>
            <i className='fa fa-lock'/> Lock
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            disabled={this.state.selectedMapId === ''}
            onClick={this.unlockMap}>
            <i className='fa fa-unlock'/> Unlock
          </button>

          <hr/>

          <div className='mdl-cell mdl-cell--12-col'>

          </div>

          <RelatedTests relatedTests={[

          ]}/>
        </div>
      </div>
    );
  }
}

MapSetMotionLockModeTest.propTypes = {
  maps: PropTypes.array
};

export default MapSetMotionLockModeTest;
