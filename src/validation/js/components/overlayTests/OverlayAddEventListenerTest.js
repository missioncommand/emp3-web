import React, {Component, PropTypes} from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import {RelatedTests} from '../../containers';
import {VSelect} from '../shared';

class OverlayAddEventListenerTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';

    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }

    this.state = {
      selectedOverlayId: selectedOverlayId,
      selectedEvent: ''
    };

    this.addEventListener = this.addEventListener.bind(this);
    this.updateSelectedEvent = this.updateSelectedEvent.bind(this);
    this.selectOverlay = this.selectOverlay.bind(this);
  }

  /**
   * React lifecycle function
   */
  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      let overlay = _.clone(_.first(props.overlays));
      this.setState({selectedOverlayId: overlay.geoId, overlay: overlay});
    }
  }

  selectOverlay(overlay) {
    this.setState({
      selectedOverlayId: overlay.geoId,
      overlay:{...overlay}
    });
  }

  updateSelectedEvent(event) {
    this.setState({selectedEvent: emp3.api.enums.EventType[event.target.value]});
  }

  addEventListener() {
    const {overlays} = this.props,
      overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});

    overlay.addEventListener({
      eventType: this.state.selectedEvent,
      callback: event => {
        let successString;
        // Needed to list out outputs in a minimalistic fashion for some channels so I could verify the correctness of
        // the event args.
        switch(event.type) {
            case emp3.api.enums.EventType.CONTAINER:
              var geoIds = [];

              for (var i = 0; i < event.affectedChildren.length; i++) {
                geoIds.push(event.affectedChildren[i].geoId);
              }
              successString = JSON.stringify({

                affectedChildren: geoIds,
                target: event.target.geoId
              });
              break;
            case emp3.api.enums.EventType.OVERLAY_CHANGE:
              successString = JSON.stringify({

                target: event.target.geoId,
                name: event.target.name
              });
              break;
            default:
              successString = JSON.stringify(event);
        }
        toastr.success(event.type, successString);
      }
    });

    toastr.success('Added event listener to ' + overlay.name);
  }

  render() {
    const {overlays} = this.props;
    return (
      <div>
        <span className='mdl-layout-title'>overlay.addEventListener</span>
        <div className='mdl-grid'>
          <DropdownList
            className='mdl-cell mdl-cell--12-col'
            data={overlays}
            valueField='geoId'
            textField='name'
            value={this.state.selectedOverlayId}
            onChange={this.selectOverlay}/>

          <div className='mdl-cell mdl-cell--12-col'>
            <VSelect
              id='mapAddEventListeners-event'
              callback={this.updateSelectedEvent}
              values={emp3.api.enums.EventType}
              label="Select which event you'd like to listen to."/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            disabled={this.state.selectedOverlayId === ''}
            onClick={this.addEventListener}>
            Add EventListener
          </button>

          <RelatedTests relatedTests={[
            {text: 'Unsubscribe to an overlay event', target: 'overlayRemoveEventListenerTest'},
            {text: 'Subscribe to a map event', target: 'mapRemoveEventListenerTest'},
            {text: 'Subscribe to a feature event', target: 'featureAddEventListenerTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

OverlayAddEventListenerTest.propTypes = {
  overlays: PropTypes.array
};

export default OverlayAddEventListenerTest;
