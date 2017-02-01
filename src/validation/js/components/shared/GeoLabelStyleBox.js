import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {VText} from '../shared';

class GeoLabelStyleBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      color: '',
      outlineColor: ''
    };

    this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleUpdate(event) {
    const {callback} = this.props;
    let field = event.target.id.split('-')[1];
    let value = event.target.value;
    let newState = {...this.state};

    newState[field] = value;
    this.setState(newState, () => {
      let newStyle = {...this.state};

      let colors;
      if (this.state.color) {
        colors = this.state.color.split(',');
        newStyle.color = {
          red: colors[0] ? parseInt(colors[0]) : 0,
          green: colors[1] ? parseInt(colors[1]) : 0,
          blue: colors[2] ? parseInt(colors[2]) : 0,
          alpha: colors[3] ? parseFloat(colors[3]) : 1.0
        };
      } else {
        newStyle.color = undefined;
      }

      if (this.state.outlineColor) {
        colors = this.state.outlineColor.split(',');
        newStyle.outlineColor = {
          red: colors[0] ? parseInt(colors[0]) : 0,
          green: colors[1] ? parseInt(colors[1]) : 0,
          blue: colors[2] ? parseInt(colors[2]) : 0,
          alpha: colors[3] ? parseFloat(colors[3]) : 1.0
        };
      } else {
        newStyle.outlineColor = undefined;
      }

      if (this.state.size !== '') {
        newStyle.size = isNaN(this.state.size) ? undefined : parseInt(this.state.size);
      }

      if (this.state.scale !== '') {
        newStyle.scale = isNaN(this.state.scale) ? undefined : parseInt(this.state.scale);
      }

      callback(newStyle);
    });
  }

  render() {
    let {style} = this.props;
    style = style || {};

    const classes = classNames(this.props.classNames, 'mdl-grid');
    return (
      <div className={classes}>
        <span className='mdl-layout-title'>Label Style</span>
        <VText
          id='geoLabelStyle-color'
          classes={['mdl-cell', 'mdl-cell--12-col']}
          callback={this.handleUpdate}
          label={'Color r(0-255),g(0-255),b(0-255),a(0-1)'}
          value={this.state.color}/>

        <VText
          id='geoLabelStyle-outlineColor'
          classes={['mdl-cell', 'mdl-cell--12-col']}
          callback={this.handleUpdate}
          label={'Outline Color r(0-255),g(0-255),b(0-255),a(0-1)'}
          value={this.state.outlineColor}/>

        <VText
          id='geoLabelStyle-size'
          classes={['mdl-cell', 'mdl-cell--12-col']}
          label={'Size'}
          callback={this.handleUpdate}
          value={style.size}/>

        <VText
          id='geoLabelStyle-scale'
          classes={['mdl-cell', 'mdl-cell--12-col']}
          label={'Scale'}
          callback={this.handleUpdate}
          value={style.scale}/>

        <VText
          id='geoLabelStyle-justification'
          classes={['mdl-cell', 'mdl-cell--12-col']}
          label={'Justification (left, right, center)'}
          callback={this.handleUpdate}
          value={style.justification}/>

        <VText
          id='geoLabelStyle-fontFamily'
          classes={['mdl-cell', 'mdl-cell--12-col']}
          label={'Font Family'}
          callback={this.handleUpdate}
          value={style.fontFamily}/>
      </div>
    );
  }
}

GeoLabelStyleBox.propTypes = {
  style: PropTypes.shape({
    color: PropTypes.object,
    outlineColor: PropTypes.object,
    fontFamily: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    justification: PropTypes.string
  }),
  classNames: PropTypes.string,
  callback: PropTypes.func.isRequired
};

GeoLabelStyleBox.defaultPropts = {
  classNames: '',
  style: {
    color: {
      red: 0,
      green: 0,
      blue: 0,
      alpha: 1
    },
    outlineColor: {
      red: 255,
      green: 255,
      blue: 255,
      alpha: 1
    },
    fontFamily: '',
    size: 12,
    justification: ''
  }
};

export default GeoLabelStyleBox;
