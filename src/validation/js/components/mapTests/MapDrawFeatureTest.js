import React, {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import VText from '../shared/VText';
import PropertiesBox from '../shared/PropertiesBox';

class MapDrawFeatureTest extends Component {

  constructor(props) {
    super(props);

    let selectedMapId = '';
    if (props.maps.length > 0) {
      selectedMapId = _.first(props.maps).geoId;
    }

    this.state = {
      selectedMapId: selectedMapId,
      featureType: emp3.api.enums.FeatureTypeEnum.GEO_PATH,
      geoId: '',
      name: '',
      symbolStandard: '2525c',
      symbolCode: '',
      properties: {}
    };

    this.updateSelectedMap = this.updateSelectedMap.bind(this);
    this.updateFeatureType = this.updateFeatureType.bind(this);
    this.updateFeatureProperties = this.updateFeatureProperties.bind(this);
    this.updateFeature = this.updateFeature.bind(this);
    this.mapDrawFeature = this.mapDrawFeature.bind(this);
    this.mapCancelDraw = this.mapCancelDraw.bind(this);
    this.mapCompleteDraw = this.mapCompleteDraw.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.maps.length > 0 && this.state.selectedMapId === '') {
      this.setState({selectedMapId: _.first(props.maps).geoId});
    }
  }

  updateSelectedMap(event) {
    this.setState({
      selectedMapId: event.target.value
    });
  }

  updateFeatureType(event) {

    let enumValue = event.target.value;
    this.setState({
      featureType: enumValue
    });
  }

  updateFeature(event) {
    if (event.target.id === "mapDrawFeature-name") {
      this.setState({
        name: event.target.value
      });
    } else if (event.target.id === "mapDrawFeature-geoId") {
      this.setState({
        geoId: event.target.value
      });
    }
  }

  updateFeatureProperties(field, value) {
    let properties = {...this.state.properties};
    properties[field] = value;
    this.setState({
      properties: properties
    });
  }

  mapCancelDraw() {
    var map;
    map = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    map.cancelDraw();
  }

  mapCompleteDraw() {
    var map;
    map = _.find(this.props.maps, {geoId: this.state.selectedMapId});

    map.completeDraw();
  }

  mapDrawFeature() {
    const {maps, addError} = this.props;
    var feature;
    const featureArgs = {
      name: this.state.name,
      geoId: this.state.geoId
    };

    for (var field in this.state.properties) {
      featureArgs[field] = this.state.properties[field];
    }

    const map = _.find(maps, {geoId: this.state.selectedMapId});

    if (map) {
      try {
        switch (this.state.featureType) {
          case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
            feature = new emp3.api.AirControlMeasure(featureArgs);
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
            feature = new emp3.api.Circle(featureArgs);
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
            feature = new emp3.api.Ellipse(featureArgs);
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
            feature = new emp3.api.MilStdSymbol(featureArgs);
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
            feature = new emp3.api.Path(featureArgs);
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
            feature = new emp3.api.Point(featureArgs);
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
            feature = new emp3.api.Polygon(featureArgs);
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
            feature = new emp3.api.Square(featureArgs);
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
            feature = new emp3.api.Rectangle(featureArgs);
            break;
          case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
            feature = new emp3.api.Text(featureArgs);
            break;
        }

        map.drawFeature({
          feature: feature,
          onDrawStart: (args) => {
            toastr.success('Map.DrawFeature onDrawStart called: \n ' +
              JSON.stringify(args));
          },
          onDrawUpdate: (args) => {
            toastr.success('Map.DrawFeature onDrawUpdate called: \n ' +
              JSON.stringify(args));
          },
          onDrawComplete: (args) => {
            toastr.success('Map.DrawFeature onDrawComplete called: \n ' +
              JSON.stringify(args));
          },
          onDrawCancel: (args) => {
            toastr.success('Map.DrawFeature onDrawCancel called: \n ' +
              JSON.stringify(args));
          },
          onError: (err) => {
            toastr.error(JSON.stringify(err), 'Map.drawFeatures');
            addError(err, 'Map.drawFeatures');
          }
        });
      } catch (err) {
        toastr.error(err.message, 'Map.drawFeatures: Critical');
      }
    }
  }

  render() {
    return (
      <div>

        <h3>Draw on the map</h3>

        <label htmlFor='mapGetCamera-map'>Select which map you want to draw to</label>
        <select className='blocky' id='mapGetCamera-map' value={this.state.selectedMapId}
                onChange={this.updateSelectedMap}>
          {this.props.maps.map(map => {
            return <option key={map.geoId} value={map.geoId}>{map.container}</option>;
          })}
        </select>

        <label htmlFor='mapGetCamera-map'>Select the type of feature you want to draw</label>
        <select className='blocky' id='mapGetCamera-map' value={this.state.featureType}
                onChange={this.updateFeatureType}>
          <option value={emp3.api.enums.FeatureTypeEnum.GEO_ACM}>ACM</option>
          <option value={emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE}>Circle</option>
          <option value={emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE}>Ellipse</option>
          <option value={emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL}>MilStdSymbol</option>
          <option value={emp3.api.enums.FeatureTypeEnum.GEO_PATH}>Path</option>
          <option value={emp3.api.enums.FeatureTypeEnum.GEO_POINT}>Point</option>
          <option value={emp3.api.enums.FeatureTypeEnum.GEO_POLYGON}>Polygon</option>
          <option value={emp3.api.enums.FeatureTypeEnum.GEO_SQUARE}>Square</option>
          <option value={emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE}>Rectangle</option>
          <option value={emp3.api.enums.FeatureTypeEnum.GEO_TEXT}>Text</option>
        </select>

        <VText id='mapDrawFeature-geoId' label="GeoId" value={this.state.geoId} callback={this.updateFeature}/>
        <VText id='mapDrawFeature-name' label="Name" value={this.state.name} callback={this.updateFeature}/>

        <PropertiesBox properties={this.state.properties} featureType={this.state.featureType} callback={this.updateFeatureProperties}/>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.mapDrawFeature}>
          Draw
        </button>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.mapCancelDraw}>
          Cancel
        </button>

        <button className='blocky mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                onClick={this.mapCompleteDraw}>
          Complete
        </button>

        <RelatedTests relatedTests={[
          {text: 'Cancel the draw'},
          {text: 'Complete the draw'},
          {text: 'Edit a feature'}
        ]}/>
      </div>
    );
  }
}

MapDrawFeatureTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  maps: PropTypes.array.isRequired
};

export default MapDrawFeatureTest;
