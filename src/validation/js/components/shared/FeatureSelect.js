import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class FeatureSelect extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {label, selectedFeatureId, features, callback} = this.props;
    return (
      <div>
        <label htmlFor={this.refs.select}>{label}</label>
        <select ref='select' id='featureSelection' value={selectedFeatureId} onChange={callback}>
          <option value=''>None</option>
          {features.map(feature => {
            let optionText = feature.name !== '' ? feature.name : feature.geoId.substring(0, 8) + '...';
            return (
              <option
                key={feature.geoId}
                value={feature.geoId}
                title={feature.name + ' : ' + feature.geoId}>
                {optionText}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    features: state.features
  };
};

FeatureSelect.propTypes = {
  selectedFeatureId: PropTypes.string.isRequired,
  features: PropTypes.array.isRequired,
  label: PropTypes.string,
  callback: PropTypes.func.isRequired
};

FeatureSelect.defaultProps = {
  selectedFeatureId: ''
};

export default connect(
  mapStateToProps
)(FeatureSelect);
