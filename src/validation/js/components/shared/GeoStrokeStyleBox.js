import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {VText} from '../shared';

class GeoStrokeStyleBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      strokeColor: '',
      stipplingPattern: '',
      stipplingFactor: '',
      strokeWidth: ''
    };

    this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleUpdate(event) {
    const {callback} = this.props;

    let field = event.target.id.split('-')[1],
      value = event.target.value,
      newState = {...this.state};

    newState[field] = value;

    // Set the string values locally and pass back the object values
    this.setState(newState, () => {
      let newStyle = {...this.state};
      let strokeRGBA = this.state.strokeColor.split(',');

      newStyle.strokeWidth = isNaN(newStyle.strokeWidth) ? undefined : parseInt(newStyle.strokeWidth);
      newStyle.stipplingFactor = isNaN(newStyle.stipplingFactor) ? undefined : parseInt(newStyle.stipplingFactor);

      if (newStyle.strokeColor) {
        newStyle.strokeColor = {
          red: strokeRGBA[0] ? parseInt(strokeRGBA) : 0,
          green: strokeRGBA[1] ? parseInt(strokeRGBA[1]) : 0,
          blue: strokeRGBA[2] ? parseInt(strokeRGBA[2]) : 0,
          alpha: strokeRGBA[3] ? parseFloat(strokeRGBA[3]) : 1.0
        };
      }

      callback(newStyle);
    });
  }

  render() {
    const classes = classNames(this.props.classNames, 'mdl-grid');

    return (
      <div className={classes}>
        <span className='mdl-layout-title'>Stroke Style</span>

        <VText id='geoStrokeStyle-strokeColor'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               callback={this.handleUpdate}
               label={'Color r(0-255),g(0-255),b(0-255),a(0-1)'}
               value={this.state.strokeColor}/>

        <VText id='geoStrokeStyle-strokeWidth'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               callback={this.handleUpdate}
               label={'Stroke Width in Pixels'}
               value={this.state.strokeWidth}/>

        <VText id='geoStrokeStyle-stipplingPattern'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               callback={this.handleUpdate}
               label={'Stippling Pattern (String)'}
               value={this.state.stipplingPattern}/>

        <VText id='geoStrokeStyle-stipplingFactor'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               callback={this.handleUpdate}
               label={'Stippling Factor (Number)'}
               value={this.state.stipplingFactor}/>
      </div>
    );
  }
}

GeoStrokeStyleBox.propTypes = {
  classNames: PropTypes.string,
  callback: PropTypes.func.isRequired
};

GeoStrokeStyleBox.defaultPropts = {
  classNames: ''
};

export default GeoStrokeStyleBox;
