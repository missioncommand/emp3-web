import React, {Component, PropTypes} from 'react';
import VText from './VText';
import VCheckBox from './VCheckBox';
import VSelect from './VSelect';
import GeoLabelStyleBox from './GeoLabelStyleBox';
import GeoFillStyleBox from './GeoFillStyleBox';
import GeoStrokeStyleBox from './GeoStrokeStyleBox';

import {ALTITUDEMODE, ICONSIZE} from '../../constants';

class PropertiesBox extends Component {

  constructor(props) {
    super(props);

    // Handle special cased modifier properties as strings
    this.state = {
      altitudeMode: '',
      azimuth: '',
      buffer: '',
      extrude: false,
      fillStyle: {
        fillColor: '',
        fillPattern: ''
      },
      labelStyle: {},
      strokeStyle: {
        strokeColor: '',
        strokePattern: ''
      },
      readOnly: false,
      strokeColor: '',
      strokePattern: '',
      strokeWidth: '',
      tessellate: false,
      timeStamp: '',
      symbolCode: '',
      symbolStandard: '',
      iconURI: '',
      iconSize: '',
      offsetX: '',
      offsetY: '',

      acmType: '',

      modifiers: {
        additionalInfo1: '',
        additionalInfo2: '',
        additionalInfo3: '',
        altitudeDepth: '',
        azimuth: '',
        combatEffectiveness: '',
        commonIdentifier: '',
        countryCode: '',
        dateTimeGroup: '',
        dateTimeGroup2: '',
        distance: '',
        directionOfMovement: '',
        equipmentTeardownTime: '',
        equipmentType: '',
        evaluationRating: '',
        higherFormation: '',
        hostile: '',
        iffSif: '',
        location: '',
        platformType: '',
        quantity: '',
        reducedOrReinforced: '',
        sigintMobilityIndicator: '',
        signatureEquipment: '',
        sonarClassificationConfidence: '',
        specialC2Headquarters: '',
        speed: '',
        speedLeader: false,
        staffComments: '',
        uniqueDesignation1: '',
        uniqueDesignation2: ''
      }
    };

    this.callback = this.callback.bind(this);
    this.handleLabelStyleUpdate = this.handleLabelStyleUpdate.bind(this);
    this.handleStrokeStyleUpdate = this.handleStrokeStyleUpdate.bind(this);
    this.handleFillStyleUpdate = this.handleFillStyleUpdate.bind(this);
  }

  handleLabelStyleUpdate(style) {
    const {callback} = this.props;
    this.setState({labelStyle: style}, () => {
      callback('labelStyle', style);
    });
  }

  handleStrokeStyleUpdate(style) {
    const {callback} = this.props;
    this.setState({strokeStyle: style}, () => {
      callback('strokeStyle', style);
    });
  }

  handleFillStyleUpdate(style) {
    const {callback} = this.props;
    this.setState({fillStyle: style}, () => {
      callback('fillStyle', style);
    });
  }

  componentWillReceiveProps(props) {
    let updatedFeature = {...this.state};

    if (props.modifiers) {
      if (props.modifiers.distance ||
        props.modifiers.altitudeDepth ||
        props.modifiers.azimuth) {

        updatedFeature.modifiers.distance = JSON.stringify(props.modifiers.distance);
        updatedFeature.modifiers.altitudeDepth = JSON.stringify(props.modifiers.altitudeDepth);
        updatedFeature.modifiers.azimuth = JSON.stringify(props.modifiers.azimuth);
      }
    }

    this.setState(updatedFeature);
  }

  callback(event) {
    const {callback, properties} = this.props;

    let prop = event.target.id,
      val = event.target.value,
      i;

    let feature = {...properties};
    feature.modifiers = feature.modifiers || {};
    feature.labelStyle = feature.labelStyle || {};

    switch (event.target.id) {
      case 'azimuth':
        if (event.target.value) {
          val = isNaN(event.target.value) ? event.target.value : parseFloat(event.target.value);
          feature[prop] = val;
        } else {
          feature[prop] = '';
        }

        this.setState(feature, () => {
          callback(prop, val);
        });

        break;
      case 'distance': // these three need to handle an array of values
      case 'altitudeDepth':
      case 'modAzimuth':
        // convert field id to proper modifier value name
        if (prop === "modAzimuth") {
          prop = "azimuth";
        }

        if (val === "") {
          feature.modifiers[prop] = undefined;
        } else {
          feature.modifiers[prop] = val;
        }

        this.setState(feature, () => {
          let values = [];
          let stringArrayValues = this.state.modifiers[prop].split(" ");
          for (i = 0; i < stringArrayValues.length; i++) {
            let tmpVal = isNaN(stringArrayValues[i]) ? 0 : parseFloat(stringArrayValues[i]);
            values.push(tmpVal);
          }

          let valuesMod = {...this.state.modifiers};
          valuesMod[prop] = values;
          callback('modifiers', valuesMod);
        });
        break;
      case 'additionalInfo1':
      case 'additionalInfo2':
      case 'additionalInfo3':
      case 'combatEffectiveness':
      case 'commonIdentifier':
      case 'countryCode':
      case 'dateTimeGroup':
      case 'dateTimeGroup2':
      case 'directionOfMovement':
      case 'equipmentTeardownTime':
      case 'equipmentType':
      case 'evaluationRating':
      case 'higherFormation':
      case 'hostile':
      case 'iffSif':
      case 'location':
      case 'platformType':
      case 'quantity':
      case 'reducedOrReinforced':
      case 'sigintMobilityIndicator':
      case 'signatureEquipment':
      case 'sonarClassificationConfidence':
      case 'specialC2Headquarters':
      case 'speed':
      case 'staffComments':
      case 'uniqueDesignation1':
      case 'uniqueDesignation2':
        if (val === "") {
          feature.modifiers[prop] = undefined;
        } else {
          feature.modifiers[prop] = val;
        }

        this.setState(feature, () => {
          callback('modifiers', feature.modifiers);
        });
        break;
      case 'speedLeader':
        if (val === false) {
          feature.modifiers.speedLeader = undefined;
        } else {
          feature.modifiers.speedLeader = val;
        }

        this.setState(feature, () => {
          callback('modifiers', feature.modifiers);
        });
        break;
      case 'altitudeMode':
        if (val === 'NONE') {
          val = undefined;
        }
        feature.altitudeMode = val;
        this.setState(feature, () => {
          callback(prop, val);
        });
        break;
      default:
        feature[prop] = val;
        this.setState(feature, () => {
          callback(prop, val);
        });
    }
  }

  render() {
    const {featureType} = this.props;

    let renderable = (
      <div className='mdl-grid mdl-grid--no-spacing'>
        <VText id='azimuth' classes={['mdl-cell', 'mdl-cell--12-col']}
               label='Azimuth'
               value={this.state.azimuth}
               callback={this.callback}/>

        <VText id='buffer' classes={['mdl-cell', 'mdl-cell--12-col']}
               label='Buffer'
               value={this.state.buffer}
               callback={this.callback}/>

        <VText id='timeStamp' classes={['mdl-cell', 'mdl-cell--12-col']}
               label='timeStamp'
               value={this.state.timeStamp}
               callback={this.callback}/>

        <VCheckBox id='extrude' classes={['mdl-cell', 'mdl-cell--12-col']}
                   label='Extrude'
                   checked={this.state.extrude}
                   callback={this.callback}/>

        <VCheckBox id='readOnly' classes={['mdl-cell', 'mdl-cell--12-col']}
                   label='Read Only'
                   checked={this.state.readOnly}
                   callback={this.callback}/>

        <VCheckBox id='tessellate' classes={['mdl-cell', 'mdl-cell--12-col']}
                   label='Tessellate'
                   checked={this.state.tessellate}
                   callback={this.callback}/>

        <VSelect id='altitudeMode' classes={['mdl-cell', 'mdl-cell--12-col']}
                 label='Altitude Mode'
                 values={ALTITUDEMODE}
                 value={this.state.altitudeMode}
                 callback={this.callback}/>
      </div>
    );

    let milSymbol = (
      <div className='mdl-grid mdl-grid--no-spacing'>
        {renderable}
        <VText id='symbolCode' label='MIL-STD-2525 Symbol Code' value={this.state.symbolCode}
               callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

        <VSelect id='symbolStandard' label='MIL-STD-2525 Standard' values={{'2525b': '2525b', '2525c': '2525c'}}
                 value={this.state.symbolStandard} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

        <span className='mdl-layout-title'> Modifiers </span>
        <div id='symbolModifiers' className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
          <VText id='additionalInfo1' label='Additional Information 1' value={this.state.modifiers.additionalInfo1}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='additionalInfo2' label='Additional Information 2' value={this.state.modifiers.additionalInfo2}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='additionalInfo3' label='Additional Information 3' value={this.state.modifiers.additionalInfo3}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          {/* NOTICE modifiers.altitudeDepth can be an array so requires special formatting, see componentWillReceiveProps */}
          <VText id='altitudeDepth' label='Altitude/Depth' value={this.state.modifiers.altitudeDepth}
                 callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          {/* NOTICE modifiers.azimuth can be an array so requires special formatting, see componentWillReceiveProps */}
          <VText id='modAzimuth' label='Azimuth' value={this.state.modifiers.azimuth} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='combatEffectiveness' label='Combat Effectiveness' value={this.state.modifiers.combatEffectiveness}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='commonIdentifier' label='Common Identifier' value={this.state.modifiers.commonIdentifier}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='countryCode' label='Country Code' value={this.state.modifiers.countryCode} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='dateTimeGroup' label='Date Time Group (DDHHMMSSZMONYYYY)'
                 value={this.state.modifiers.dateTimeGroup}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='dateTimeGroup2' label='Date Time Group 2 (DDHHMMSSZMONYYYY)'
                 value={this.state.modifiers.dateTimeGroup2}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='directionOfMovement' label='Direction of Movement' value={this.state.modifiers.directionOfMovement}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          {/* NOTICE modifiers.distance can be an array so requires special formatting, see componentWillReceiveProps */}
          <VText id='distance' label='Distance' value={this.state.modifiers.distance} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='equipmentTeardownTime' label='Equipment Teardown Time'
                 value={this.state.modifiers.equipmentTeardownTime}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='equipmentType' label='Equipment Type' value={this.state.modifiers.equipmentType}
                 callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='evaluationRating' label='Evaluation Rating ([A-F][1-6] example: A4)'
                 value={this.state.modifiers.evaluationRating} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='higherFormation' label='Higher Formation' value={this.state.modifiers.higherFormation}
                 callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='hostile' label='Hostile (use ENY)' value={this.state.modifiers.hostile} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='iffSif' label='IFF/SIF' value={this.state.modifiers.iffSif} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='location' label='Location' value={this.state.modifiers.location} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='platformType' label='Platform Type (ELNOT or CENOT - valid on SIGINT)'
                 value={this.state.modifiers.platformType} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='quantity' label='Quantity' value={this.state.modifiers.quantity} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='reducedOrReinforced' label='Reinforced or Reduced (use R or D )'
                 value={this.state.modifiers.reducedOrReinforced} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='sigintMobilityIndicator' label='Sigint Mobility Indicator (M, S, or U)'
                 value={this.state.modifiers.sigintMobilityIndicator} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='signatureEquipment' label='Signature Equipment' value={this.state.modifiers.signatureEquipment}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='sonarClassificationConfidence' label='Sonar Classification Confidence'
                 value={this.state.modifiers.sonarClassificationConfidence} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='specialC2Headquarters' label='Special C2 Headquarters'
                 value={this.state.modifiers.specialC2Headquarters}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='speed' label='Speed' value={this.state.modifiers.speed} callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='staffComments' label='Staff Comments' value={this.state.modifiers.staffComments}
                 callback={this.callback}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='uniqueDesignation1' label='Unique Designation 1' value={this.state.modifiers.uniqueDesignation1}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VText id='uniqueDesignation2' label='Unique Designation 2' value={this.state.modifiers.uniqueDesignation2}
                 callback={this.callback} classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <VCheckBox id='speedLeader' label='Speed Leader' checked={this.state.modifiers.speedLeader}
                     callback={this.callback}
                     classes={['mdl-cell', 'mdl-cell--12-col']}/>
        </div>
      </div>
    );

    let path =
      <div>
        {renderable}
      </div>;

    let polygon =
      <div>
        {renderable}
      </div>;

    let acm =
      <div>
        {renderable}
      </div>;

    let circle =
      <div>
        {renderable}
      </div>;

    let square =
      <div>
        {renderable}
      </div>;

    let ellipse =
      <div>
        {renderable}
      </div>;

    let rectangle =
      <div>
        {renderable}
      </div>;

    let KML =
      <div>
        {renderable}
      </div>;

    let point =
      <div className='mdl-grid mdl-grid--no-spacing'>
        <span className='mdl-layout-title'>Point Properties</span>
        <VText id='iconURI' classes={['mdl-cell', 'mdl-cell--12-col']} label='Icon URI'
               value={this.state.iconURI} callback={this.callback}/>
        <div className='mdl-cell mdl-cell--12-col'>
          <VSelect id='iconSize' label='Icon Size' values={ICONSIZE} value={this.state.iconSize}
                   callback={this.callback}/>
        </div>
        <VText id='offsetX' classes={['mdl-cell', 'mdl-cell--12-col']} label='Offset X'
               value={this.state.offsetX} callback={this.callback}/>
        <VText id='offsetY' classes={['mdl-cell', 'mdl-cell--12-col']} label='Offset Y'
               value={this.state.offsetY} callback={this.callback}/>
        {renderable}
      </div>;

    let text =
      <div>
        {renderable}
      </div>;

    let propertyControls;

    switch (featureType) {
      case emp3.api.enums.FeatureTypeEnum.GEO_ACM:
        propertyControls = acm;
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_CIRCLE:
        propertyControls = circle;
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_ELLIPSE:
        propertyControls = ellipse;
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL:
        propertyControls = milSymbol;
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_PATH:
        propertyControls = path;
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_POINT:
        propertyControls = point;
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_POLYGON:
        propertyControls = polygon;
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_RECTANGLE:
        propertyControls = rectangle;
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_SQUARE:
        propertyControls = square;
        break;
      case emp3.api.enums.FeatureTypeEnum.GEO_TEXT:
        propertyControls = text;
        break;
      case emp3.api.enums.FeatureTypeEnum.KML:
        propertyControls = KML;
        break;
    }

    return (
      <div>
        <GeoLabelStyleBox id='labelStyle'
                          classNames={'mdl-grid--no-spacing'}
                          style={this.state.labelStyle}
                          callback={this.handleLabelStyleUpdate}/>

        <GeoStrokeStyleBox classNames={'mdl-grid--no-spacing'}
                           callback={this.handleStrokeStyleUpdate}/>

        <GeoFillStyleBox classNames={'mdl-grid--no-spacing'}
                         callback={this.handleFillStyleUpdate}/>

        {propertyControls}
      </div>
    );

  }
}

PropertiesBox.propTypes = {
  featureType: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired,

  properties: PropTypes.shape({
    altitudeMode: PropTypes.string,
    azimuth: PropTypes.string,
    buffer: PropTypes.string,
    extrude: PropTypes.bool,
    fillStyle: PropTypes.shape({
      fillColor: PropTypes.string,
      fillPattern: PropTypes.string
    }),
    strokeStyle: PropTypes.shape({
      strokeColor: PropTypes.string,
      strokePattern: PropTypes.string
    }),
    fillColor: PropTypes.string,
    fillPattern: PropTypes.string,
    labelColor: PropTypes.string,
    labelScale: PropTypes.string,
    readOnly: PropTypes.bool,
    strokeColor: PropTypes.string,
    strokePattern: PropTypes.string,
    strokeWidth: PropTypes.string,
    tessellate: PropTypes.bool,
    timeStamp: PropTypes.string,
    symbolCode: PropTypes.string,
    symbolStandard: PropTypes.string,

    iconURI: PropTypes.string,
    iconSize: PropTypes.string,
    offsetX: PropTypes.string,
    offsetY: PropTypes.string,

    acmType: PropTypes.string,

    modifiers: PropTypes.shape({
      additionalInfo1: PropTypes.string,
      additionalInfo2: PropTypes.string,
      additionalInfo3: PropTypes.string,
      altitudeDepth: PropTypes.any,
      azimuth: PropTypes.any,
      combatEffectiveness: PropTypes.string,
      commonIdentifier: PropTypes.string,
      countryCode: PropTypes.string,
      dateTimeGroup: PropTypes.string,
      dateTimeGroup2: PropTypes.string,
      distance: PropTypes.any,
      directionOfMovement: PropTypes.string,
      equipmentTeardownTime: PropTypes.string,
      equipmentType: PropTypes.string,
      evaluationRating: PropTypes.string,
      higherFormation: PropTypes.string,
      hostile: PropTypes.string,
      iffSif: PropTypes.string,
      location: PropTypes.string,
      platformType: PropTypes.string,
      quantity: PropTypes.string,
      reducedOrReinforced: PropTypes.string,
      sigintMobilityIndicator: PropTypes.string,
      signatureEquipment: PropTypes.string,
      sonarClassificationConfidence: PropTypes.string,
      specialC2Headquarters: PropTypes.string,
      speed: PropTypes.string,
      speedLeader: PropTypes.bool,
      staffComments: PropTypes.string,
      uniqueDesignation1: PropTypes.string,
      uniqueDesignation2: PropTypes.string
    })
  })
};

export default PropertiesBox;
