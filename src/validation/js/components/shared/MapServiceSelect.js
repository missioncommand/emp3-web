import React, {Component, PropTypes} from 'react';

class MapServiceSelect extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <label htmlFor='mapServiceSelection'>{this.props.label}</label>
        <select className='blocky' id='mapServiceSelection' value={this.props.selectedMapServiceId} onChange={this.props.callback}>
          <option value=''>None</option>
          {this.props.mapServices.map(mapService => {
            return <option key={mapService.geoId} value={mapService.geoId}>{mapService.name}</option>;
          })}
        </select>
      </div>
    );
  }
}

MapServiceSelect.propTypes = {
  selectedMapServiceId: PropTypes.string.isRequired,
  mapServices: PropTypes.array.isRequired,
  label: PropTypes.string,
  callback: PropTypes.func.isRequired
};

MapServiceSelect.defaultProps = {
  selectedMapServiceId: ''
};

export default MapServiceSelect;
