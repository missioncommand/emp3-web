import React, {Component, PropTypes} from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import {connect} from 'react-redux';

class MapSelect extends Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(map) {
    const {callback} = this.props;
    callback({target: {value: map.geoId}});
  }

  render() {
    const {maps, selectedMapId, label, className} = this.props;
    return (
      <div>
        <label htmlFor='mapSelection'>{label}</label>

        <DropdownList
          className={className}
          data={maps}
          valueField='geoId'
          textField='container'
          value={selectedMapId}
          onChange={this.handleChange}/>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    maps: state.maps
  };
};

MapSelect.propTypes = {
  selectedMapId: PropTypes.string.isRequired,
  maps: PropTypes.array.isRequired,
  label: PropTypes.string,
  readOnly: PropTypes.bool,
  callback: PropTypes.func.isRequired,
  className: PropTypes.string
};

MapSelect.defaultProps = {
  selectedMapId: '',
  readOnly: false
};

export default connect(
  mapStateToProps
)(MapSelect);
