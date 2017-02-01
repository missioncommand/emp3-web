import * as React from 'react';
import {Component, PropTypes} from 'react';

class VSelect extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {keySuffix, id, label, value, values, callback, className} = this.props;
    const suffix = keySuffix === '' ? id : keySuffix;

    return (
      <div className={className}>
        <label htmlFor={id}>{label}</label>
        <select id={id}
                value={value || _.first(values)}
                onChange={callback}>
          {_.map(values, (value, key) => {
            return <option key={key + suffix} value={key}>{value}</option>;
          })}
        </select>
      </div>
    );
  }
}

VSelect.propTypes = {
  className: PropTypes.string,
  callback: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  value: PropTypes.any,
  values: PropTypes.object.isRequired,
  keySuffix: PropTypes.string
};

VSelect.defaultProps = {
  className: '',
  keySuffix: ''
};

export default VSelect;
