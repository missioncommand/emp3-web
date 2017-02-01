import React, {Component, PropTypes} from 'react';
import {MapSelect} from '../shared';

class RecorderPlayback extends Component {
  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      recording: [],
      selectedMapId: selectedMapId,
      currentEntry: "No recording loaded.",
      currentIndex: 0,
      playDisabled: true,
      pauseDisabled: true,
      advanceDisabled: true,
      resetDisabled: true
    };


    this.play = this.play.bind(this);
    this.playEntry = this.playEntry.bind(this);
    this.pause = this.pause.bind(this);
    this.advance = this.advance.bind(this);
    this.load = this.load.bind(this);
    this.readFile = this.readFile.bind(this);
    this.reset = this.reset.bind(this);
    this.recording = [];
    this.previousTimestamp = 0;
    this.fileReader;
    this.timer;
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  load(event) {

    // create a file reader to read in the recording.
    var file = event.target;
    this.fileReader = new FileReader();

    // when the file is read, it will call readFile.
    this.fileReader.onload = this.readFile;

    // read the file as text--not as binary stream or other type.
    this.fileReader.readAsText(file.files[0]);
  }

  readFile() {

    // the file has loaded, parse the results into an array.
    var text = this.fileReader.result;
    var results = JSON.parse(text);
    this.recording = results.results;

    // enable the play and reset button.
    this.setState({
      length: this.recording.length,
      currentIndex: 0,
      playDisabled: false,
      resetDisabled: false
    });
  }

  play() {
    var ms;
    var currentEntry;

    // enable the pause button.
    // ...but disable the play button again.
    // disable the advance button.
    this.setState({
      playDisabled: true,
      resetDisabled: false,
      advanceDisabled: true,
      pauseDisabled: false
    });

    if (this.state.currentIndex < this.recording.length) {

      currentEntry = this.recording[this.state.currentIndex];

      var stringCurrentEntry = JSON.stringify(currentEntry);
      this.setState({
        currentEntry: stringCurrentEntry
      });

      if (this.previousTimestamp === 0) {
        ms = 0;
      } else {
        ms = currentEntry.timestamp - this.previousTimestamp;
      }
      this.previousTimestamp = currentEntry.timestamp;
      this.timer = setTimeout(this.playEntry.bind(this), ms, currentEntry);

    } else {
      this.setState({
        currentEntry: "End of recording."
      });
    }
  }

  playEntry(entry) {

    var message;
    var environment;
    var currentEntry;
    var currentIndex = this.state.currentIndex;
    var ms;



    message = entry.logEntry;
    if (entry.logEntry.dest) {
      message.dest = {
        id: this.state.selectedMapId
      };
    }

    environment = emp3.api.MessageHandler.getInstance().getEnvironment();
    environment.pubSub.publish(message);
    currentIndex++;

    if (currentIndex < this.recording.length) {

      currentEntry = this.recording[currentIndex];

      var stringCurrentEntry = JSON.stringify(currentEntry);

      this.setState({
        currentIndex: currentIndex,
        currentEntry: stringCurrentEntry
      });

      if (this.previousTimestamp === 0) {
        ms = 0;
      } else {
        ms = currentEntry.timestamp - this.previousTimestamp;
      }

      this.previousTimestamp = currentEntry.timestamp;
      this.timer = setTimeout(this.playEntry.bind(this), ms, currentEntry);

    } else {
      this.setState({
        currentIndex: currentIndex,
        currentEntry: "End of recording."
      });
    }

  }

  pause() {

    // disable the pause button.
    // ...but re-enable the play button again.
    // ...but re-enable the advance button again.
    this.setState({
      playDisabled: false,
      resetDisabled: false,
      advanceDisabled: false,
      pauseDisabled: true
    });
    clearTimeout(this.timer);
  }

  advance() {
    var message;
    var environment;
    var currentEntry;
    var currentIndex = this.state.currentIndex;
    currentEntry = this.recording[this.state.currentIndex];

    this.setState({
      currentEntry: JSON.stringify(currentEntry)
    });



    message = currentEntry.logEntry;

    if (currentEntry.logEntry.dest) {
      message.dest = {
        id: this.state.selectedMapId
      };
    }

    environment = emp3.api.MessageHandler.getInstance().getEnvironment();
    environment.pubSub.publish(message);

    // update the states of what the next entry will be and the time stamp.
    currentIndex++;
    this.setState({
      currentIndex: currentIndex
    });
    this.previousTimestamp = currentEntry.timestamp;
  }

  reset() {
    this.setState({
      currentIndex: 0
    });
  }


  render() {
    const {maps} = this.props;
    return (
      <div>
        <span className='mdl-layout-title'>Playback Recording</span>

        <div className='mdl-cell mdl-cell--12-col'>
          <MapSelect maps={maps}
                     selectedMapId={this.state.selectedMapId}
                     label='Add to '
                     callback={event => this.setState({selectedMapId: event.target.value})}/>
        </div>

        <input type='file' id='recording' onChange={this.load}/>
        <br/>

        <button onClick={this.pause} disabled={this.state.pauseDisabled} id='player-pause'>Pause</button>
        <button onClick={this.advance} disabled={this.state.advanceDisabled} id='player-advance'>Advance</button>
        <button onClick={this.play}  disabled={this.state.playDisabled} id='player-play'>Play</button>
        <button onClick={this.reset} disabled={this.state.resetDisabled} id='player-reset'>Reset</button>

        <br/>
        <label>{this.state.length === undefined ? 'no file loaded' : this.state.currentIndex + ' of ' + this.state.length}</label>
        <br/>
        <textarea type='text' rows= '10' id='recorder-currentEntry' disabled value={this.state.currentEntry}></textarea>
      </div>
    );
  }
}

RecorderPlayback.propTypes = {
  maps: PropTypes.array.isRequired
};

export default RecorderPlayback;
