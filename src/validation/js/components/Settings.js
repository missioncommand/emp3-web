import React, {Component, PropTypes} from 'react';
import EMPStorageStructure from './EMPStorageStructure';
import EMPStorageVisualizer from './EMPStorageVisualizer';
import {connect} from 'react-redux';

//======================================================================================================================
let MapCard = ({map}) => {
  return (
    <div className='mdl-cell mdl-card mdl-shadow--2dp mdl-color--blue-grey-200 mdl-color-text--primary-contrast'>
      <div className='mdl-card__title mdl-card--expand'>
        <h2>{map.container}</h2>
      </div>

      <div className='mdl-card__supporting-text'>
        <span style={{fontSize: '0.9em'}}>{map.geoId}</span>
        {map.description}
      </div>

      <div className='mdl-card__actions mdl-card--border'>
        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect'>
          Remove
        </button>
      </div>
    </div>
  );
};

MapCard.propTypes = {
  map: PropTypes.object
};

//======================================================================================================================
let OverlayCard = ({overlay}) => {
  return (
    <div className='mdl-cell mdl-card mdl-shadow--2dp mdl-color--blue-grey-200 mdl-color-text--primary-contrast'>
      <div className='mdl-card__title mdl-card--expand'>
        <h2>{overlay.name}</h2>
      </div>

      <div className='mdl-card__supporting-text'>
        <span style={{fontSize: '0.9em'}}>{overlay.geoId}</span>
        {overlay.description}
      </div>

      <div className='mdl-card__actions mdl-card--border'>
        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect'>
          Remove
        </button>
      </div>
    </div>
  );
};

OverlayCard.propTypes = {
  overlay: PropTypes.object
};

//======================================================================================================================
let FeatureCard = ({feature}) => {
  return (
    <div className='mdl-cell mdl-card mdl-shadow--2dp mdl-color--blue-grey-200 mdl-color-text--primary-contrast'>
      <div className='mdl-card__title mdl-card--expand'>
        <h2>{feature.name}</h2>
      </div>

      <div className='mdl-card__supporting-text'>
        <span style={{fontSize: '0.9em'}}>{feature.geoId}</span>
        {feature.description} <br/>
        {feature.featureType} {feature.featureType === 'milstd' ? ' - ' + feature.symbolCode : null}
      </div>

      <div className='mdl-card__actions mdl-card--border'>
        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect'>
          Remove
        </button>
      </div>
    </div>
  );
};

FeatureCard.propTypes = {
  feature: PropTypes.object
};

//======================================================================================================================
let ServiceCard = ({service}) => {
  service.layers = service.layers || [];

  return (
    <div className='mdl-cell mdl-card mdl-shadow--2dp mdl-color--blue-grey-200 mdl-color-text--primary-contrast'>
      <div className='mdl-card__title mdl-card--expand'>
        <h2>{service.name}</h2>
      </div>

      <div className='mdl-card__supporting-text'>
        <span style={{fontSize: '0.9em'}}>{service.geoId}</span>
        {service.description} <br/>
        {service.url} <br/>
        <ul>
          {service.layers.map(layer => {
            return <li key={layer}>{layer}</li>;
          })}
        </ul>
      </div>

      <div className='mdl-card__actions mdl-card--border'>
        <button
          className='mdl-button mdl-js-button mdl-js-ripple-effect'>
          Remove
        </button>
      </div>
    </div>
  );
};

ServiceCard.propTypes = {
  service: PropTypes.object
};

//======================================================================================================================

class Settings extends Component {

  render() {
    const {maps, overlays, features, mapServices} = this.props;

    return (
      <div className='mdl-tabs mdl-js-tabs mdl-js-ripple-effect' style={{height: '100%', width: '100%'}}>
        <div className='mdl-tabs__tab-bar'>
          <a href='#settings-emp3global' className='mdl-tabs__tab is-active'>EMP3 Global</a>
          <a href='#settings-maps' className='mdl-tabs__tab'>Maps</a>
          <a href='#settings-overlays' className='mdl-tabs__tab'>Overlays</a>
          <a href='#settings-features' className='mdl-tabs__tab'>Features</a>
          <a href='#settings-mapServices' className='mdl-tabs__tab'>Services</a>
          <a href='#settings-EMPStorage' className='mdl-tabs__tab'>EMP Store</a>
          <a href='#settings-EMPStorageVisualizer' className='mdl-tabs__tab'>EMP Visualizer</a>
        </div>
        <div id="settings-emp3global" className="mdl-tabs__panel is-active">
          <div className="mdl-grid">
            <div className="mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-space">
              <div className="mdl-cell mdl-cell--4-col">emp3.api.global.configuration.urlProxy</div>
              <div className="mdl-cell mdl-cell--8-col">
                <input type="text" placeholder="url proxy location"
                       defaultValue={emp3.api.global.configuration.urlProxy}
                       onChange={(event) => {
                         emp3.api.global.configuration.urlProxy = event.target.value;
                       }}/>
              </div>
            </div>

            { /* Dummy apply button to take focus out of the input fields */ }
            { /* Will eventually be smarter but doesn't need to for now */ }
            <button
              className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-cell mdl-cell--8-col">
              Apply
            </button>

          </div>
        </div>
        <div id='settings-maps' className='mdl-tabs__panel'>
          <div className='mdl-grid'>
            {maps.map(map => {
              return <MapCard key={map.geoId} map={map}/>;
            })}
          </div>
        </div>
        <div id='settings-overlays' className='mdl-tabs__panel'>
          <div className='mdl-grid'>
            {overlays.map(overlay => {
              return <OverlayCard key={overlay.geoId} overlay={overlay}/>;
            })}
          </div>
        </div>
        <div id='settings-features' className='mdl-tabs__panel'>
          <div className='mdl-grid'>
            {features.map(feature => {
              return <FeatureCard key={feature.geoId} feature={feature}/>;
            })}
          </div>
        </div>

        <div id='settings-mapServices' className='mdl-tabs__panel'>
          <div className='mdl-grid'>
            {mapServices.map(service => {
              return <div key={service.geoId} className='mdl-cell mdl-cell--6-col'><ServiceCard service={service}/>
              </div>;
            })}
          </div>
        </div>
        <div id='settings-EMPStorage' className='mdl-tabs__panel'>
          <EMPStorageStructure />
        </div>
        <div id='settings-EMPStorageVisualizer' className='mdl-tabs__panel'>
          <EMPStorageVisualizer />
        </div>
      </div>
    );
  }
}

Settings.propTypes = {
  dispatch: PropTypes.func,
  maps: PropTypes.array,
  overlays: PropTypes.array,
  features: PropTypes.array,
  mapServices: PropTypes.array
};

const mapStateToProps = state => {
  return {
    maps: state.maps,
    overlays: state.overlays,
    features: state.features,
    mapServices: state.mapServices
  };
};

export default connect(mapStateToProps)(Settings);
