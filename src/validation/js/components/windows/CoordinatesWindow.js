import React, {Component, PropTypes} from 'react';
import Draggable from 'react-draggable';
import keymirror from 'keymirror';

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
      },
      locked: false
    };

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.copyCoordsToClipboard = this.copyCoordsToClipboard.bind(this);
    this.reposition = this.reposition.bind(this);
  }

  componentDidMount() {
    const {map} = this.props;
    map.addEventListener({
      eventType: emp3.api.enums.EventType.MAP_CURSOR_MOVE,
      callback: this.handleMouseMove
    });

    // map.addEventListener({
    //   eventType: emp3.api.enums.EventType.MAP_INTERACTION,
    //   callback: this.handleDoubleClick
    // });
  }

  componentWillUnmount() {
    const {map} = this.props;
    if (map) {
      map.removeEventListener({
        eventType: emp3.api.enums.EventType.MAP_CURSOR_MOVE,
        callback: this.handleMouseMove
      });

      // map.removeEventListener({
      //   eventType: emp3.api.enums.EventType.MAP_INTERACTION,
      //   callback: this.handleDoubleClick
      // });
    }
  }

  handleMouseMove(coords) {
    if (!this.state.locked) {
      let coord = {
        latitude: coords.position.latitude.toFixed(6),
        longitude: coords.position.longitude.toFixed(6)
      };
      this.setState({
        coords: coord
      });
    }
  }

  handleDoubleClick(event) {
    if (event.event === emp3.api.enums.UserInteractionEventEnum.DOUBLE_CLICKED) {
      this.setState({locked: !this.state.locked});
    }
  }

  copyCoordsToClipboard() {
    let range = document.createRange();
    range.selectNodeContents(this.refs.coords);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    try {
      let successful = document.execCommand('copy');
      if (!successful) {
        toastr.error('Copy failed');
      }
    } catch (err) {
      window.console.error(err);
    }
    window.getSelection().removeAllRanges();
  }

  reposition() {
    toastr.info('moving to match parent');
  }

  render() {
    const {map, style} = this.props;

    return (
      <Draggable handle='.dragHandle'>
        <div className="coordinateWindow" style={style}>
          <div className="dragHandle">
            {map.container} Coordinates
          </div>
          <div style={{padding: '2px'}}>

            <div style={{display: 'inline'}} ref="coords">Lon: {this.state.coords.longitude},
              Lat: {this.state.coords.latitude}</div>

            <i className="fa fa-clipboard coordIconButton"
               title="Copy coordinates"
               onClick={this.copyCoordsToClipboard}/>
          </div>
        </div>
      </Draggable>
    );
  }
}

CoordinatesWindow.propTypes = {
  map: PropTypes.instanceOf(emp3.api.Map),
  style: PropTypes.object
};

CoordinatesWindow.defaultProps = {
  style: {}
};

export default CoordinatesWindow;
