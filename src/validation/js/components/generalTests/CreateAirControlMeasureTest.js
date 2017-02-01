import * as React from 'react';
import {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';
import {PropertiesBox, OverlaySelect, VText} from '../shared/';
import {createRandomPositionsKML, convertPositionStringToGeoPositions} from '../../util/LocationGen.js';
import DropdownList from 'react-widgets/lib/DropdownList';

class CreateAirControlMeasureTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }
    this.state = {
      name: '',
      geoId: '',
      selectedOverlayId: selectedOverlayId,
      positions: '',
      attributes: [],
      featureProps: {},
      selectedAcmType: ''
    };

    this.updatePositionsWithRandom = this.updatePositionsWithRandom.bind(this);
    this.createAirControlMeasure = this.createAirControlMeasure.bind(this);
    this.createAirControlMeasureAddToOverlay = this.createAirControlMeasureAddToOverlay.bind(this);
    this.addAttributes = this.addAttributes.bind(this);
    this.updateAttributes = this.updateAttributes.bind(this);
    this.removeAttributes = this.removeAttributes.bind(this);
    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.updateAirControlMeasure = this.updateAirControlMeasure.bind(this);
    this.updateProperties = this.updateProperties.bind(this);
    this.handleAcmTypeChange = this.handleAcmTypeChange.bind(this);
  }

  componentDidUpdate() {
    componentHandler.upgradeDom();
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  updatePositionsWithRandom() {
    this.setState({
      positions: createRandomPositionsKML(3)
    });
  }

  updateSelectedOverlay(ev) {
    this.setState({
      selectedOverlayId: ev.target.value
    });
  }

  updateAttributes(ev) {
    let newAttributes = [...this.state.attributes],
      temp,
      i,
      type;

    temp = ev.target.id.split('_');
    i = temp[1];
    type = temp[0].split('-')[1];

    newAttributes[i][type] = ev.target.value;

    this.setState({
      attributes: newAttributes
    });
  }

  addAttributes() {
    this.setState({
      attributes: [...this.state.attributes, {
        radius: '',
        innerRadius: '',
        turn: '',
        minAlt: '',
        maxAlt: '',
        leftAzimuth: '',
        rightAzimuth: '',
        width: '',
        leftWidth: '',
        rightWidth: '',
        altitudeMode: ''
      }]
    });
  }

  removeAttributes(idx) {
    let newAttributes = this.state.attributes;
    newAttributes.splice(idx, 1);
    this.setState({attributes: newAttributes});
  }

  createAirControlMeasure() {
    let acm;
    let attributes;
    let args = {...this.state.featureProps};

    args.name = this.state.name.trim() === '' ? undefined : this.state.name.trim();
    args.geoId = this.state.geoId.trim() === '' ? undefined : this.state.geoId.trim();
    args.positions = convertPositionStringToGeoPositions(this.state.positions);
    args.acmType = this.state.geoId.trim() === '' ? undefined : this.state.selectedAcmType;

    attributes = this.state.attributes.map(attributes => {
      return {
        radius: attributes.radius.trim() === '' ? undefined : parseInt(attributes.radius.trim()),
        innerRadius: attributes.innerRadius.trim() === '' ? undefined : parseInt(attributes.innerRadius.trim()),
        turn: attributes.turn.trim() === '' ? undefined : attributes.turn.trim(),
        minAlt: attributes.minAlt.trim() === '' ? undefined : parseInt(attributes.minAlt.trim()),
        maxAlt: attributes.maxAlt.trim() === '' ? undefined : parseInt(attributes.maxAlt.trim()),
        leftAzimuth: attributes.leftAzimuth.trim() === '' ? undefined : parseInt(attributes.leftAzimuth.trim()),
        rightAzimuth: attributes.rightAzimuth.trim() === '' ? undefined : parseInt(attributes.rightAzimuth.trim()),
        width: attributes.width.trim() === '' ? undefined : parseInt(attributes.width.trim()),
        leftWidth: attributes.leftWidth.trim() === '' ? undefined : parseInt(attributes.leftWidth.trim()),
        rightWidth: attributes.rightWidth.trim() === '' ? undefined : parseInt(attributes.rightWidth.trim()),
        altitudeMode: attributes.altitudeMode.trim() === '' ? undefined : attributes.altitudeMode.trim()
      };
    });

    if (attributes.length > 0) {
      args.attributes = attributes;
    }

    try {
      acm = new emp3.api.AirControlMeasure(args);
      this.props.addFeature(acm);
      this.props.addResult(args, 'createAirControlMeasure');
      toastr.success(JSON.stringify(args), 'AirControlMeasure Created Successfully');
    } catch (err) {
      this.props.addError(err.message, 'createAirControlMeasure');
      toastr.error(err.message, 'Create AirControlMeasure Failed');
    }

    return acm;
  }

  createAirControlMeasureAddToOverlay() {
    const {overlays, addError, addResult} = this.props;

    if (this.state.selectedOverlayId === '') {
      toastr.warning('No overlay selected');
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});
    const acm = this.createAirControlMeasure();


    if (overlay) {
      overlay.addFeatures({
        features: [acm],
        onSuccess: () => {
          addResult(acm, 'createAirControlMeasureAddToOverlay');
          toastr.success('Added AirControlMeasure to Overlay successfully', 'Create AirControlMeasure');
        },
        onError: (err) => {
          addError(err, 'createAirControlMeasureAddToOverlay');
          toastr.error(err.errorMessage, 'Failed to add AirControlMeasure to overlay', 'Create AirControlMeasure');
        }
      });
    } else {
      toastr.error('No overlay selected', 'No overlay selected', 'Create AirControlMeasure');
    }
  }

  updateAirControlMeasure(ev) {
    if (ev.target.id === 'createAirControlMeasure-name') {
      this.setState({name: ev.target.value});
    } else if (ev.target.id === 'createAirControlMeasure-geoId') {
      this.setState({geoId: ev.target.value});
    } else if (ev.target.id === 'createAirControlMeasure-positions') {
      this.setState({positions: ev.target.value});
    }
  }

  updateProperties(propertyName, value) {

    const newFeatureProperties = {...this.state.featureProps};
    newFeatureProperties[propertyName] = value;

    try {
      this.setState({
        featureProps: newFeatureProperties
      });
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  }

  /**
   * Creates a sample and puts in on the map.
   */
  createSample(symbolCode) {

    let args = {...this.state.featureProps};
    let attributes = {};
    let positions = [];

    let getRandom = function (min, max) {
      return Math.random() * (max - min) + min;
    };

    let getRandomLine = function (lat, lon, minPoints) {
      let coordinates = [];
      let numPoints;
      let nextLat;
      let nextLon;

      if (!minPoints) {
        minPoints = 2;
      }

      numPoints = getRandom(minPoints - 1, 4);

      coordinates.push({
        latitude: lat,
        longitude: lon
      });

      for (let i = 0; i < numPoints; i++) {
        nextLat = getRandom(coordinates[i].latitude - 5, coordinates[i].latitude + 5);
        nextLon = getRandom(coordinates[i].longitude + 1, coordinates[i].longitude + 5);

        coordinates.push({
          latitude: nextLat,
          longitude: nextLon
        });
      }

      return coordinates;
    };

    let getRandomAttributes = function (num) {
      let attributes = [];
      for (let i = 0; i < num; i++) {
        let minAlt = getRandom(5000, 100000);
        let maxAlt = getRandom(100000, 200000);
        let leftWidth = getRandom(5000, 50000);
        let rightWidth = getRandom(5000, 50000);

        attributes.push({
          minAlt: minAlt,
          maxAlt: maxAlt,
          leftWidth: leftWidth,
          rightWidth: rightWidth
        });
      }
      return attributes;
    };

    let lat = getRandom(40, 60);
    let lon = getRandom(40, 60);
    let minAlt = getRandom(5000, 100000);
    let maxAlt = getRandom(100000, 200000);
    let radius = getRandom(10000, 100000);
    let innerRadius = getRandom(5000, 10000);
    let leftAzimuth = getRandom(0, 180);
    let rightAzimuth = getRandom(180, 360);
    let width = getRandom(5000, 75000);
    let leftWidth = getRandom(5000, 50000);
    let rightWidth = getRandom(5000, 50000);
    let turn = Math.round(getRandom(0, 2));

    if (turn === 0) {
      turn = "Left";
    } else if (turn === 1) {
      turn = "Center";
    } else if (turn === 2) {
      turn = "Right";
    }

    switch (symbolCode) {
      case cmapi.enums.acmType.CURTAIN:

        attributes = {
          minAlt: minAlt,
          maxAlt: maxAlt
        };

        positions = [{
          latitude: lat,
          longitude: lon
        }];

        args.attributes = [attributes];
        args.positions = getRandomLine(lat, lon);
        args.acmType = cmapi.enums.acmType.CURTAIN;
        break;

      case cmapi.enums.acmType.CYLINDER:
        attributes = {
          minAlt: minAlt,
          maxAlt: maxAlt,
          radius: radius
        };

        positions = [{
          latitude: lat,
          longitude: lon
        }];

        args.attributes = [attributes];
        args.positions = positions;
        args.acmType = cmapi.enums.acmType.CYLINDER;

        break;
      case cmapi.enums.acmType.ORBIT:
        attributes = {
          minAlt: minAlt,
          maxAlt: maxAlt,
          width: width,
          turn: turn
        };

        args.attributes = [attributes];
        args.positions = getRandomLine(lat, lon);
        args.acmType = cmapi.enums.acmType.ORBIT;
        break;
      case cmapi.enums.acmType.POLYARC:
        attributes = {
          minAlt: minAlt,
          maxAlt: maxAlt,
          radius: radius,
          leftAzimuth: leftAzimuth,
          rightAzimuth: rightAzimuth
        };

        args.attributes = [attributes];
        args.positions = getRandomLine(lat, lon, 3);
        args.acmType = cmapi.enums.acmType.POLYARC;
        break;
      case cmapi.enums.acmType.POLYGON:
        attributes = {
          minAlt: minAlt,
          maxAlt: maxAlt
        };

        args.attributes = [attributes];
        args.positions = getRandomLine(lat, lon, 3);
        args.acmType = cmapi.enums.acmType.POLYGON;
        break;

      case cmapi.enums.acmType.RADARC:
        attributes = {
          minAlt: minAlt,
          maxAlt: maxAlt,
          radius: radius,
          innerRadius: innerRadius,
          leftAzimuth: leftAzimuth,
          rightAzimuth: rightAzimuth
        };

        positions = [{
          latitude: lat,
          longitude: lon
        }];

        args.attributes = [attributes];
        args.positions = positions;
        args.acmType = cmapi.enums.acmType.RADARC;
        break;
      case cmapi.enums.acmType.ROUTE:
        attributes = {
          minAlt: minAlt,
          maxAlt: maxAlt,
          width: width
        };

        args.attributes = [attributes];
        args.positions = getRandomLine(lat, lon);
        args.acmType = cmapi.enums.acmType.ROUTE;
        break;
      case cmapi.enums.acmType.TRACK:
        attributes = {
          minAlt: minAlt,
          maxAlt: maxAlt,
          leftWidth: leftWidth,
          rightWidth: rightWidth
        };

        args.positions = getRandomLine(lat, lon);
        args.attributes = getRandomAttributes(args.positions.length - 1);
        args.acmType = cmapi.enums.acmType.TRACK;

        break;
    }

    if (this.state.selectedOverlayId === '') {
      toastr.warning('No overlay selected');
      return;
    }

    const overlay = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});
    const acm = new emp3.api.AirControlMeasure(args);

    this.props.addFeature(acm);
    toastr.success(JSON.stringify(args), 'AirControlMeasure Created Successfully');

    if (overlay) {
      overlay.addFeatures({
        features: [acm],
        onSuccess: () => {
          this.props.addResult(acm, 'createAirControlMeasureAddToOverlay');
          toastr.success('Added AirControlMeasure to Overlay successfully', 'Create AirControlMeasure');
        },
        onError: (err) => {
          this.props.addError(err, 'createAirControlMeasureAddToOverlay');
          toastr.error(err.errorMessage, 'Failed to add AirControlMeasure to overlay', 'Create AirControlMeasure');
        }
      });
    } else {
      toastr.error('No overlay selected', 'No overlay selected', 'Create AirControlMeasure');
    }
  }

  handleAcmTypeChange(symbolCodeObject) {
    this.setState({
      selectedAcmType: symbolCodeObject.value
    });
  }

  apply() {
    let acm;
    let attributes;
    let property;

    const {features} = this.props;

    acm = _.find(features, {geoId: this.state.geoId});

    acm.positions = convertPositionStringToGeoPositions(this.state.positions);
    acm.acmType = this.state.selectedAcmType;

    attributes = this.state.attributes.map(attributes => {
      return {
        radius: attributes.radius.trim() === '' ? undefined : parseInt(attributes.radius.trim()),
        innerRadius: attributes.innerRadius.trim() === '' ? undefined : parseInt(attributes.innerRadius.trim()),
        turn: attributes.turn.trim() === '' ? undefined : attributes.turn.trim(),
        minAlt: attributes.minAlt.trim() === '' ? undefined : parseInt(attributes.minAlt.trim()),
        maxAlt: attributes.maxAlt.trim() === '' ? undefined : parseInt(attributes.maxAlt.trim()),
        leftAzimuth: attributes.leftAzimuth.trim() === '' ? undefined : parseInt(attributes.leftAzimuth.trim()),
        rightAzimuth: attributes.rightAzimuth.trim() === '' ? undefined : parseInt(attributes.rightAzimuth.trim()),
        width: attributes.width.trim() === '' ? undefined : parseInt(attributes.width.trim()),
        leftWidth: attributes.leftWidth.trim() === '' ? undefined : parseInt(attributes.leftWidth.trim()),
        rightWidth: attributes.rightWidth.trim() === '' ? undefined : parseInt(attributes.rightWidth.trim()),
        altitudeMode: attributes.altitudeMode.trim() === '' ? undefined : attributes.altitudeMode.trim()
      };
    });

    acm.attributes = attributes;

    for (property in this.state.featureProps) {
      acm[property] = this.state.featureProps[property];
    }

    try {
      acm.apply();
      toastr.success('Acm.apply() succeeded ' + JSON.stringify(acm.positions));
    } catch (err) {
      toastr.error(err.message, 'Create Acm Add To Overlay:Critical');
    }
  }

  render() {
    const {overlays} = this.props;

    let attributes = [];

    for (let i = 0; i < this.state.attributes.length; i++) {
      attributes.push(
        <div key={'attributes_' + i} className='mdl-grid'>
          <button className='mdl-button mdl-js-button mdl-button--icon mdl-button--colored mdl-cell mdl-cell--3-col'
                  onClick={this.removeAttributes.bind(this, i)}>
            <i className='fa fa-minus'/>
          </button>
          <VText id={'createAcm-radius_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].radius}
                 callback={this.updateAttributes}
                 label='Radius'/>
          <VText id={'createAcm-innerRadius_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].innerRadius}
                 callback={this.updateAttributes}
                 label='Inner Radius'/>
          <VText id={'createAcm-turn_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].turn}
                 callback={this.updateAttributes}
                 label='Turn'/>
          <VText id={'createAcm-minAlt_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].minAlt}
                 callback={this.updateAttributes}
                 label='Min Alt'/>
          <VText id={'createAcm-maxAlt_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].maxAlt}
                 callback={this.updateAttributes}
                 label='Max Alt'/>
          <VText id={'createAcm-leftAzimuth_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].leftAzimuth}
                 callback={this.updateAttributes}
                 label='Left Azimuth'/>
          <VText id={'createAcm-rightAzimuth_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].rightAzimuth}
                 callback={this.updateAttributes}
                 label='Right Azimuth'/>
          <VText id={'createAcm-width_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].width}
                 callback={this.updateAttributes}
                 label='Width'/>
          <VText id={'createAcm-leftWidth_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].leftWidth}
                 callback={this.updateAttributes}
                 label='Left Width'/>
          <VText id={'createAcm-rightWidth_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].rightWidth}
                 callback={this.updateAttributes}
                 label='Right Width'/>
          <VText id={'createAcm-altitudeMode_' + i}
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 value={this.state.attributes[i].altitudeMode}
                 callback={this.updateAttributes}
                 label='Altitude Mode'/>

          <button className='mdl-button mdl-js-button mdl-button--icon mdl-button--colored mdl-cell mdl-cell--3-col'
                  onClick={this.removeAttributes.bind(this, i)}>
            <i className='fa fa-minus'/>
          </button>
        </div>
      );
    }

    var acmTypes = [
      {label: 'Curtain', value: "CURTAIN--------"},
      {label: 'Cylinder', value: "CYLINDER-------"},
      {label: 'Orbit', value: "ORBIT----------"},
      {label: 'Polyarc', value: "POLYARC--------"},
      {label: 'Polygon', value: "POLYGON--------"},
      {label: 'Radarc', value: "RADARC---------"},
      {label: 'Route', value: "ROUTE----------"},
      {label: 'Track', value: "TRACK----------"}
    ];

    const {className} = this.props;

    return (

      <div>
        <span className='mdl-layout-title'>Create an AirControlMeasure</span>

        <div className='mdl-grid'>
          <VText id='createAirControlMeasure-name'
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 label="Name"
                 callback={this.updateAirControlMeasure}
                 value={this.state.name}/>

          <VText id='createAirControlMeasure-geoId'
                 classes={['mdl-cell', 'mdl-cell--12-col']}
                 label="GeoId"
                 callback={this.updateAirControlMeasure}
                 value={this.state.geoId}/>

          <div className='mdl-cell mdl-cell--12-col'>
          <DropdownList
                className={className}
                data={acmTypes}
                valueField='value'
                textField='label'
                value={this.selectedAcmType}
                onChange={this.handleAcmTypeChange}/>
          </div>

          <VText id='createAirControlMeasure-positions'
                classes={['mdl-cell', 'mdl-cell--9-col']}
                value={this.state.positions}
                callback={this.updateAirControlMeasure}
                label='Positions'/>

          <button className='mdl-button mdl-js-button mdl-button--icon mdl-button--colored mdl-cell mdl-cell--1-col'
                  onClick={this.updatePositionsWithRandom} title='Generate random position'>
            <i className='material-icons'>+</i>
          </button>

          <div className='mdl-cell mdl-cell--12-col'>
            {attributes}
            <button className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--colored'
                    onClick={this.addAttributes}>
              Add Attributes
            </button>
          </div>



          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createAirControlMeasure}>
            Create ACM
          </button>

          <div className='mdl-cell mdl-cell--12-col'>
            <OverlaySelect id='selectedOverlay' label='Select which overlay to add to'
                           overlays={overlays}
                           selectedOverlayId={this.state.selectedOverlayId}
                           callback={this.updateSelectedOverlay}/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createAirControlMeasureAddToOverlay} disabled={overlays.length === 0}>
            Add ACM
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.apply()}>
            Update
          </button>

          <div className='mdl-cell mdl-cell--12-col'>
            <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEO_ACM} callback={this.updateProperties}
                           properties={this.state.featureProps}/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.createSample(cmapi.enums.acmType.CURTAIN)} disabled={overlays.length === 0}>
            Curtain
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.createSample(cmapi.enums.acmType.CYLINDER)} disabled={overlays.length === 0}>
            Cylinder
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.createSample(cmapi.enums.acmType.ORBIT)} disabled={overlays.length === 0}>
            Orbit
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.createSample(cmapi.enums.acmType.POLYARC)} disabled={overlays.length === 0}>
            Polyarc
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.createSample(cmapi.enums.acmType.POLYGON)} disabled={overlays.length === 0}>
            Polygon
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.createSample(cmapi.enums.acmType.RADARC)} disabled={overlays.length === 0}>
            Radarc
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.createSample(cmapi.enums.acmType.ROUTE)} disabled={overlays.length === 0}>
            Route
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={() => this.createSample(cmapi.enums.acmType.TRACK)} disabled={overlays.length === 0}>
            Track
          </button>

          <RelatedTests className='mdl-cell mdl-cell--12-col' relatedTests={[
            {text: 'Create an Overlay', target: 'createOverlayTest'},
            {text: 'Add this feature to an overlay'},
            {text: 'Add this feature to another feature'}
          ]}/>
        </div>
      </div>
    );
  }
}

CreateAirControlMeasureTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired,
  overlays: PropTypes.array.isRequired,
  features: PropTypes.array.isRequired,
  className: PropTypes.string
};

export default CreateAirControlMeasureTest;
