import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {VText} from '../shared';

class GeoIconStyleBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      size: '',
      offSetX: '',
      offSetY: ''
    };

    this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleUpdate(event) {
    const {callback} = this.props;

    let field = event.target.id.split('-')[1];
    let value = event.target.value;
    let newState = {...this.state};

    newState[field] = value;

    // Set the state with string, return the object
    this.setState(newState, () => {
      let convertedProps = {};
      if (this.state.size && !isNaN(this.state.size)) {
        convertedProps.size = parseInt(this.state.size);
      }

      if (this.state.offSetX && !isNaN(this.state.offSetX)) {
        convertedProps.offSetX = parseInt(this.state.offSetX);
      }

      if (this.state.offSetY && !isNaN(this.state.size)) {
        convertedProps.offSetY = parseInt(this.state.offSetY);
      }
      callback('geoIconStyle', convertedProps);
    });
  }

  render() {
    const classes = classNames(this.props.classNames, 'mdl-grid mdl-grid--no-spacing');
    return (
      <div className={classes}>
        <span className='mdl-layout-title'>GeoIconStyle</span>

        <VText id='geoIconStyle-size'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               callback={this.handleUpdate}
               label={'Size (number)'}
               value={this.state.size}/>

        <VText id='geoIconStyle-offSetX'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               callback={this.handleUpdate}
               label={'offSetX'}
               value={this.state.offSetX}/>

        <VText id='geoIconStyle-offSetY'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               callback={this.handleUpdate}
               label={'offSetY'}
               value={this.state.offSetY}/>
      </div>
    );
  }
}

GeoIconStyleBox.propTypes = {
  style: PropTypes.shape({
    size: PropTypes.number,
    offSetX: PropTypes.number,
    offSetY: PropTypes.number
  }),
  classNames: PropTypes.string,
  callback: PropTypes.func.isRequired
};

GeoIconStyleBox.defaultPropts = {
  classNames: ''
};

export default GeoIconStyleBox;
