import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {FeatureSelect} from '../shared';

class FeatureAddEventListenerTest extends Component {
  constructor(props) {
    super(props);

    let selectedFeatureId = '';
    if (props.features.length > 0) {
      selectedFeatureId = _.first(props.features).geoId;
    }
    this.state = {
      selectedFeatureId: selectedFeatureId,
      selectedEvent: '',
      eventResultTextArea: ''
    };
    this.addEventListener = this.addEventListener.bind(this);
    this.updateSelectedFeature = this.updateSelectedFeature.bind(this);
    // this.updateSelectedEvent = this.updateSelectedEvent.bind(this);
  }

  /**
   * React lifecycle function
   */
  componentWillReceiveProps(props) {
    if (props.features.length > 0 && this.state.selectedFeatureId === '') {
      this.setState({selectedFeatureId: _.first(props.features).geoId});
    }
  }

  updateSelectedFeature(event) {
    this.setState({selectedFeatureId: event.target.value});
  }

  addEventListener() {
    if (this.state.selectedFeatureId === '') {
      toastr.warning('Please select a feature first');
      return;
    }
    const {features, appendEventListenerCallbackMessage, addEventListenerCallback, addResult, addError} = this.props;
    const feature = _.find(features, {geoId: this.state.selectedFeatureId});
    const args = {
      eventType: emp3.api.enums.EventType.CONTAINER,
      callback: args => {
        appendEventListenerCallbackMessage(args.type, "\n----------------\n\n" + new Date().toTimeString() + ", " + JSON.stringify(args));
        toastr.success(args.type, JSON.stringify(args));
      }
    };

    try {
      const callback = feature.addEventListener(args);
      addEventListenerCallback(args.eventType, callback);
      addResult(args, 'addEventListenerCallback');
      toastr.success('Feature addEventListenerCallback Success');
    } catch (err) {
      addError(err.message, 'addEventListenerCallback');
      toastr.error(err.message, 'Feature addEventListenerCallback Failed');
    }
  }

  render() {
    const {features, eventListeners} = this.props;

    return (
      <div>
        <span className='mdl-layout-title'>Subscribe to a Feature's Container Event</span>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col'>
            <FeatureSelect
              features={features}
              selectedFeatureId={this.state.selectedFeatureId}
              callback={this.updateSelectedFeature}
              label="Select which feature's events you'd like to listen to."/>
          </div>
          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            disabled={this.state.selectedFeatureId === ''}
            onClick={this.addEventListener}>
            Subscribe
          </button>
          <div className='mdl-cell mdl-cell--12-col'>
            <label htmlFor="featureAddEventListeners-eventResults">Event Results</label>
            <textarea
              className="mdl-textfield__input"
              type="text"
              rows="10"
              id="featureAddEventListeners-eventResults"
              value={eventListeners.lastMessage}/>
          </div>
          <div className='mdl-cell mdl-cell--12-col'>
            <RelatedTests relatedTests={[
              {text: 'Unsubscribe to a feature event'},
              {text: 'Subscribe to an overlay event'},
              {text: 'Subscribe to a map event'}
            ]}/>
          </div>
        </div>
      </div>
    );
  }
}

FeatureAddEventListenerTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  addEventListenerCallback: PropTypes.func.isRequired,
  appendEventListenerCallbackMessage: PropTypes.func.isRequired,
  features: PropTypes.array.isRequired,
  eventListeners: PropTypes.object.isRequired
};

export default FeatureAddEventListenerTest;