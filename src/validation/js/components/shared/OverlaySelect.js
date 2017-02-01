import React, {Component, PropTypes} from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import {connect} from 'react-redux';

class OverlaySelect extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * The output mimics a DOM event so most existing callbacks are not broken
   * @param overlay
   */
  handleChange(overlay) {
    const {callback} = this.props;
    callback({target: {value: overlay.geoId}});
  }

  render() {
    const {overlays, selectedOverlayId, className} = this.props;

    return (
      <DropdownList
        className={className}
        data={overlays}
        valueField='geoId'
        textField='name'
        value={selectedOverlayId}
        onChange={this.handleChange}/>
    );
  }
}

const mapStateToProps = state => {
  return {
    overlays: state.overlays
  };
};

OverlaySelect.propTypes = {
  selectedOverlayId: PropTypes.string.isRequired,
  overlays: PropTypes.array.isRequired,
  label: PropTypes.string,
  callback: PropTypes.func.isRequired,
  className: PropTypes.string
};

OverlaySelect.defaultProps = {
  selectedOverlayId: ''
};

export default connect(
  mapStateToProps
)(OverlaySelect);
