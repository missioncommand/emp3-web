import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {VText, VSelect} from '../shared';
import {FILLPATTERN} from '../../constants';

class GeoFillStyleBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      description: '',
      fillColor: '',
      fillPattern: ''
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
      let newStyle = {...this.state};
      if (this.state.fillColor !== '') {
        let colors = this.state.fillColor.split(',');
        newStyle.fillColor = {
          red: colors[0] ? parseInt(colors[0]) : 0,
          green: colors[1] ? parseInt(colors[1]) : 0,
          blue: colors[2] ? parseInt(colors[2]) : 0,
          alpha: colors[3] ? parseFloat(colors[3]) : 1.0
        };
      } else {
        newStyle.fillColor = undefined;
      }

      callback(newStyle);
    });

  }

  render() {
    const classes = classNames(this.props.classNames, 'mdl-grid');
    return (
      <div className={classes}>
        <span className='mdl-layout-title'>Fill Style</span>

        <VText id='geoFillStyle-description'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               callback={this.handleUpdate}
               label={'Description'}
               value={this.state.description}/>

        <VText id='geoFillStyle-fillColor'
               classes={['mdl-cell', 'mdl-cell--12-col']}
               callback={this.handleUpdate}
               label={'Color r(0-255),g(0-255),b(0-255),a(0-1)'}
               value={this.state.fillColor}/>

        <VSelect id='geoFillStyle-fillPattern'
                 label={'Fill Pattern'}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 callback={this.handleUpdate}
                 value={this.state.fillPattern}
                 values={FILLPATTERN}/>
      </div>
    );
  }
}

GeoFillStyleBox.propTypes = {
  style: PropTypes.shape({
    fillColor: PropTypes.string,
    fillPattern: PropTypes.string,
    description: PropTypes.string
  }),
  classNames: PropTypes.string,
  callback: PropTypes.func.isRequired
};

GeoFillStyleBox.defaultPropts = {
  classNames: ''
};

export default GeoFillStyleBox;
