import React, {Component, PropTypes} from 'react';

class VCheckBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: props.checked
    };

    this.toggle = this.toggle.bind(this);
  }

  componentWillReceiveProps(props) {
    setTimeout(this.setState({checked: props.checked}), 25);
  }

  toggle(event) {
    this.props.callback(event);
    setTimeout(this.setState({checked: event.target.checked}), 25);
  }

  render() {
    return (
      <label className='mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect'>
        <input type='checkbox' className='mdl-checkbox__input' id={this.props.id}
               onChange={this.toggle} checked={this.state.checked} disabled={this.props.disabled}/>
        <label className='mdl-checkbox__label' htmlFor={this.props.id}>{this.props.label}</label>
      </label>);
  }
}

VCheckBox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  callback: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

VCheckBox.defaultProps = {
  checked: false,
  disabled: false
};

export default VCheckBox;
