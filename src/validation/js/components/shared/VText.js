import * as React from 'react';
import classNames from 'classnames';
import {Component, PropTypes} from 'react';

class VText extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {value, label, callback, readOnly, id, rows, classes, className} = this.props;

    let classList = [
      ...classes,
      'mdl-textfield',
      'mdl-js-textfield',
      'mdl-textfield--floating-label'
    ];
    const inputClass = classNames(
      className,
      classList,
      {'is-dirty': value !== ''}// This is required to resolve React/MDL inconsistencies
    );

    let inputField = (<input className='mdl-textfield__input'
                        type='text'
                        id={id}
                        value={value}
                        onChange={callback}
                        disabled={readOnly}/>);
    if (rows > 1) {
      inputField = (<textarea className='mdl-textfield__input'
                         type='text'
                         id={id}
                         rows={rows}
                         value={value}
                         onChange={callback}
                         disabled={readOnly}/>);
    }

    return (
      <div className={inputClass}>
        {inputField}
        <label className='mdl-textfield__label'
               htmlFor={id}>
          {label}
        </label>
      </div>
    );
  }
}

VText.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  rows: PropTypes.number,
  callback: PropTypes.func,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  classes: PropTypes.arrayOf(PropTypes.string)
};

VText.defaultProps = {
  value: '',
  label: '',
  rows: 1,
  readOnly: false,
  classes: [],
  className: ""
};

export default VText;
