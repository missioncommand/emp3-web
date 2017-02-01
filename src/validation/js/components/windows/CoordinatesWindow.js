import React, {Component, PropTypes} from 'react';
import Draggable from 'react-draggable';
import keymirror from 'keymirror';
import assign from 'object-assign';

const DisplayStyles = keymirror({
  LAT_LON: null
});

class CoordinatesWindow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      style: DisplayStyles.LAT_LON,
      coords: {
        latitude: '-',
        longitude: '-'
      }
    };

    this.updateCoordinates = this.updateCoordinates.bind(this);
  }

  componentDidMount() {
    const {map} = this.props;
    map.addEventListener({
      eventType: emp3.api.enums.EventType.MAP_CURSOR_MOVE,
      callback: this.updateCoordinates
    });
  }

  updateCoordinates(coords) {
    var coord = {
      latitude: coords.position.latitude,
      longitude: coords.position.longitude
    };
    this.setState({
      coords: coord
    });
  }

  render() {
    const {map, style} = this.props;
    let divStyle = assign({}, style, {
      backgroundColor: 'rgba(208, 217, 232, 0.3)',
      width: '360px'
    });

    return (
      <Draggable zIndex={10000} handle='.dragHandle'>
        <div style={divStyle}>
          <div
            className='dragHandle'
            style={{backgroundColor: 'rgba(146,178,229,0.5)', cursor: 'move'}}>
            {map.container} Coordinates
          </div>
          <div>
            <div style={{display: 'inline', width: '160px'}}>Lat: {this.state.coords.latitude}</div>
            <span>, </span>
            <div style={{display: 'inline', width: '160px'}}>Lon: {this.state.coords.longitude}</div>
          </div>
        </div>
      </Draggable>
    );
  }
}

CoordinatesWindow.propTypes = {
  map: PropTypes.instanceOf(emp3.api.Map).isRequired,
  style: PropTypes.object
};

CoordinatesWindow.defaultProps = {
  style: {}
};

export default CoordinatesWindow;
