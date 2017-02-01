import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import classNames from 'classnames';

class MapPurgeTest extends Component {
  constructor(props) {
    super(props);
    this.removeMap = this.removeMap.bind(this);
  }

  removeMap(mapId) {
    const map = _.find(this.props.maps, {geoId: mapId});
    try {
      map.purge({
        onSuccess: () => {
          toastr.success('Removed Map');
          this.props.removeMap(mapId);
        },
        onError: err => {
          toastr.error('Failed to Remove Map');
          this.props.addError(err, 'Map.purge');
        }
      });
    } catch (err) {
      toastr.error(err.message, 'Map.purge: Critical');
    }
  }

  render() {
    return (
      <div>
        <h3>Remove Maps</h3>
        <h5>Maps</h5>
        <ul className='mdl-list' style={{maxHeight: '500px', overflowY:'auto'}}>
          {this.props.maps.length === 0 ? <li className='mdl-list__item'><span className='mdl-list__item-primary-content'>No Maps Exist</span></li> : null}
          {this.props.maps.map(map => {
              let liClass = classNames('mdl-list__item', 'mdl-list__item--two-line');
              return (
                <li key={map.geoId} className={liClass}>
                  <span className='mdl-list__item-primary-content'>{map.container}
                    <span className='mdl-list__item-sub-title'>{map.geoId}</span>
                  </span>
                  <span className='mdl-list__item-secondary-action'>
                    <button className='mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab' onClick={() => this.removeMap(map.geoId)}>
                      <i className='fa fa-times'/>
                    </button>
                  </span>
                </li>
              );
            })
          }
        </ul>
        <RelatedTests relatedTests={[
          {text: 'Create a map', target:'addMapTest'}
        ]}/>
      </div>
    );
  }
}


MapPurgeTest.propTypes = {
  addError: PropTypes.func.isRequired,
  addResult: PropTypes.func.isRequired,
  removeMap: PropTypes.func.isRequired,
  maps: PropTypes.array.isRequired
};

export default MapPurgeTest;
