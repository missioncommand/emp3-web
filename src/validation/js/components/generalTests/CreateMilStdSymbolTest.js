import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import assign from 'object-assign';
import RelatedTests from '../../containers/RelatedTests';
import {VText, SymbolExplorer, MilStdPreview} from '../shared';
import PropertiesBox from '../shared/PropertiesBox';
import DropdownList from 'react-widgets/lib/DropdownList';
import {splice} from '../../util/Splice';

import * as SE_2525B_SYMBOLS from '../../../resources/SE_2525B.XML';
import * as SE_2525C_SYMBOLS from '../../../resources/SE_2525C.XML';

import {AFFILIATION, STATUS, ECHELON, MILSTD_2525_STANDARD, MILSTD_2525_POSITIONS} from '../../constants';

class CreateMilStdSymbolTest extends Component {
  constructor(props) {
    super(props);

    let selectedOverlayId = '';
    if (props.overlays.length > 0) {
      selectedOverlayId = _.first(props.overlays).geoId;
    }
    this.state = {
      symbolDefs: SE_2525C_SYMBOLS,
      symbol: {
        name: '',
        geoId: '',
        positions: '',
        symbolCode: 'SFGPUCI----K---',
        symbolStandard: '2525c',
        modifiers: {}
      },
      affiliation: 'F',
      status: 'P',
      echelon: 'K',
      symbolStandard: MILSTD_2525_STANDARD.C,
      selectedOverlayId: selectedOverlayId,
      showModifiers: false,
      showProperties: false,
      showSymbolExplorer: false,
      symbolPoints: {
        min: 1,
        max: 1
      }
    };

    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
    this.updateSymbol = this.updateSymbol.bind(this);
    this.updateSymbolValues = this.updateSymbolValues.bind(this);

    this.constructSymbolCode = this.constructSymbolCode.bind(this);

    this.updateSymbolStandard = this.updateSymbolStandard.bind(this);
    this.updateSymbolCode = this.updateSymbolCode.bind(this);
    this.updateSymbolStringDirect = this.updateSymbolStringDirect.bind(this);
    this.plotAllSymbols = this.plotAllSymbols.bind(this);
    this.plotSymbolGroup = this.plotSymbolGroup.bind(this);
    this.createMilStdSymbol = this.createMilStdSymbol.bind(this);
    this.createMilStdSymbolAddToOverlay = this.createMilStdSymbolAddToOverlay.bind(this);
    this.updateProperties = this.updateProperties.bind(this);
    this.updatePositionsWithRandom = this.updatePositionsWithRandom.bind(this);
    this.apply = this.apply.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.overlays.length > 0 && this.state.selectedOverlayId === '') {
      this.setState({selectedOverlayId: _.first(props.overlays).geoId});
    }
  }

  updatePositionsWithRandom() {
    let symbol = {...this.state.symbol};
    symbol.positions = this.createRandomPositions(this.state.symbolPoints.min);
    this.setState({symbol: symbol});
  }

  createId() {
    var names = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india',
        'juliett', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra',
        'uniform', 'victor', 'whiskey', 'x-ray', 'yankee', 'zulu'
      ],
      adjectives = ['hot', 'cold', 'colorful', 'spastic', 'kitchy', 'fast', 'slow', 'tiny', 'large', 'tasty', 'bubbly',
        'effervescent', 'cool', 'outdated', 'mean', 'angry', 'rustic', 'tense', 'relaxing', 'fragmented', 'savory', 'slimy',
        'little', 'green', 'maple', 'syrupy', 'gooey', 'crunchy', 'scintillating', 'beefy', 'spectacular', 'fabulous', 'moist',
        'caustic', 'burning', 'shocking', 'solar', 'itchy', 'artisanal'
      ],
      words = ['pickle', 'meatball', 'dirt', 'road', 'area', 'johnny', 'soapbox', 'waffle', 'brisket', 'flapjacks', 'fridge',
        'mario', 'luigi', 'mushroom', 'cheeseburger', 'spoon', 'beans', 'tickle', 'cheddar', 'slag', 'void', 'enemy', 'friend',
        'tree', 'hoops', 'yoyo', 'checkers', 'pop', 'meal', 'potato', 'football', 'haberdashery', 'buddy', 'worm',
        'ketchup', 'liquid', 'cowbell', 'peppergrinder', 'honeydew', 'sparkle', 'rainbow', 'unicorn', 'whisperer',
        'chicken nugget', 'broccoli', 'vegeta', 'goku', 'samus', 'brolli', 'bibbity', 'bobbity', 'boo', 'android',
        'cell', 'king kai', "nouget", "peanut", "chocolate", "frog", 'hopscotch', 'rainbow', 'cabbage', 'papa', 'mama'
      ];

    return names[Math.floor(Math.random() * names.length)] + " " + adjectives[Math.floor(Math.random() * adjectives.length)] + " " + words[Math.floor(Math.random() * words.length)];
  }

  createRandomPositions(num, lat, lon) {
    const {maps} = this.props,
      map = _.first(maps);

    let range = 30,
      bounds = {
        west: 30,
        south: 30
      };

    if (map) {
      bounds = map.getBounds();
      range = bounds.north - bounds.south;
    }

    let startLat = bounds.south,
      startLon = bounds.west;

    let latAnchor,
      lonAnchor;

    if (lat !== undefined) {
      latAnchor = lat;
    } else {
      latAnchor = Math.random() * range + startLat;
    }

    if (lon !== undefined) {
      lonAnchor = lon;
    } else {
      lonAnchor = Math.random() * range + startLon;
    }

    let up = true;

    let positions = "";

    if (num === undefined || num <= 1 || num === null) {
      positions = lonAnchor.toFixed(1) + "," + latAnchor.toFixed(1);
    } else {
      // If longer than a single position, just increment lat an lon.
      // latitude will toggle up and down as the longitude moves right.
      positions = lonAnchor.toFixed(1) + "," + latAnchor.toFixed(1) + " ";

      for (let i = 1; i < num; i++) {
        if (up) {
          latAnchor += .5;
        } else {
          latAnchor -= .5;
        }
        lonAnchor += .5;

        positions += lonAnchor.toFixed(1) + "," + latAnchor.toFixed(1) + " ";
        up = !up;
      }
    }

    return positions;
  }

  updateSelectedOverlay(event) {
    this.setState({selectedOverlayId: event.target.value});
  }

  updateSymbolStandard(standard) {
    let newSymbol = {...this.state.symbol};

    newSymbol.symbolStandard = standard;
    this.setState({
      symbolStandard: standard,
      symbolDefs: standard === '2525b' ? SE_2525B_SYMBOLS : SE_2525C_SYMBOLS,
      symbol: newSymbol
    });
  }

  constructSymbolCode(symbol) {
    let newString = String(symbol.symbolCode);

    // update affiliation and status if symbol do not start with w (METOC)
    if (!newString.toLowerCase().startsWith("w"))
    {
      newString = splice(newString, this.state.affiliation, MILSTD_2525_POSITIONS.IDENTITY);
      // update status
      newString = splice(newString, this.state.status, MILSTD_2525_POSITIONS.STATUS);
    }

    let unitEchelon = armyc2.c2sd.renderer.utilities.SymbolUtilities.canUnitHaveModifier(
      newString,
      armyc2.c2sd.renderer.utilities.ModifiersTG.B_ECHELON,
      this.state.symbol.symbolStandard === '2525b' ? 0 : 1);
    let tgEchelon = armyc2.c2sd.renderer.utilities.SymbolUtilities.canSymbolHaveModifier(
      newString,
      armyc2.c2sd.renderer.utilities.ModifiersUnits.B_ECHELON,
      this.state.symbol.symbolStandard === '2525b' ? 0 : 1);

    // update echelon
    if (unitEchelon || tgEchelon) {
      newString = splice(newString, this.state.echelon, MILSTD_2525_POSITIONS.MODIFIER_2);
    }

    // update properties
    return newString;
  }

  updateSymbolValues(event) {
    let newSymbol = {...this.state.symbol},
      prop = event.target.id.split('-')[1];

    newSymbol[prop] = event.target.value;

    this.setState({symbol: newSymbol}, this.updateSymbol);
  }

  updateSymbolStringDirect(event) {
    let newSymbol = {...this.state.symbol},
      prop = event.target.id.split('-')[1];

    if (event.target.value.length > 15) {
      return;
    }
    newSymbol[prop] = event.target.value;

    this.setState({symbol: newSymbol}); // no updating, assume manual input overrides
  }

  updateSymbol() {
    let symbolCode = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(this.state.symbol.symbolCode, this.state.symbol.symbolStandard);
    let symbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(symbolCode, this.state.symbol.symbolStandard);

    let minPoints = 1,
      maxPoints = 1;

    if (symbolDef && symbolDef.maxPoints !== 1) {
      minPoints = symbolDef.minPoints;
      maxPoints = symbolDef.maxPoints;
    }

    let symbol = {...this.state.symbol};
    symbol.symbolCode = this.constructSymbolCode(symbol);

    this.setState({
      symbol: symbol,
      symbolPoints: {
        min: minPoints,
        max: maxPoints
      }
    });
  }

  updateProperties(propertyName, value) {
    const newSymbol = {...this.state.symbol};
    newSymbol[propertyName] = value;

    this.setState({symbol: newSymbol});
  }

  updateSymbolCode(symbolCode) {
    let newSymbol = assign({}, this.state.symbol, {symbolCode: symbolCode});
    newSymbol.symbolCode = this.constructSymbolCode(newSymbol);

    this.setState({symbol: newSymbol}, this.updateSymbol);
  }

  createSymbolArray(symbolTree, symbolArray) {
    //traverse the tree to pull out the nodes and their data
    let item;
    for (item in symbolTree) {
      if (symbolTree[item].hasOwnProperty('$')) {
        symbolArray.push({
          symbolCode: symbolTree[item].$.SYMBOLID,
          drawCategory: symbolTree[item].$.DRAWCATEGORY,
          description: symbolTree[item].$.DESCRIPTION
        });
      }

      if (symbolTree[item].hasOwnProperty('SYMBOL')) {
        this.createSymbolArray(symbolTree[item].SYMBOL, symbolArray);
      }
    }
  }

  plotAllSymbols() {
    const {addFeatures, overlays} = this.props;
    if (this.state.selectedOverlayId === '') {
      toastr.warning('No overlay selected');
      return;
    }

    let list = [...this.state.symbolDefs.SYMBOLEXPLORER.SYMBOL];
    let flattenedList = [];

    this.createSymbolArray(list, flattenedList);

    const symbolsList = [];
    let lat = 30;
    let lon = 30;
    let positions;

    for (let symbol of flattenedList) {
      try {
        let drawCategory = symbol.drawCategory;
        drawCategory = parseInt(drawCategory);
        let distance;
        let azimuth;
        let milStdSymbol;
        let symbolCode;
        let symbolDef;

        if (!armyc2.c2sd.renderer.utilities.SymbolUtilities.isWeather(symbol.symbolCode)) {
          symbolCode = this.constructSymbolCode(symbol);
        } else {
          symbolCode = symbol.symbolCode;
        }

        symbolCode = symbolCode.replace(/\*/g, '-');

        if (drawCategory !== armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_DONOTDRAW) {
          if (drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_POINT) {
            positions = [{
              latitude: lat,
              longitude: lon
            }];
            milStdSymbol = new emp3.api.MilStdSymbol({
              name: symbol.description,
              symbolCode: symbolCode,
              positions: positions
            });
          } else if (drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_PARAMETERED_AUTOSHAPE) {
            positions = [{
              latitude: lat,
              longitude: lon
            }];
            distance = [10000];
            milStdSymbol = new emp3.api.MilStdSymbol({
              name: symbol.description,
              symbolCode: symbolCode,
              positions: positions,
              modifiers: {
                distance: distance
              }
            });
          } else if (drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_RECTANGULAR_PARAMETERED_AUTOSHAPE) {
            positions = [{
              latitude: lat,
              longitude: lon
            }];
            distance = [10000, 20000];
            milStdSymbol = new emp3.api.MilStdSymbol({
              name: symbol.description,
              symbolCode: symbolCode,
              positions: positions,
              modifiers: {
                distance: distance
              }
            });
          } else if (drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_SECTOR_PARAMETERED_AUTOSHAPE) {
            positions = [{
              latitude: lat,
              longitude: lon
            }];
            distance = [10000, 20000];
            azimuth = [-45, 45];
            milStdSymbol = new emp3.api.MilStdSymbol({
              name: symbol.description,
              symbolCode: symbolCode,
              positions: positions,
              modifiers: {
                distance: distance,
                azimuth: azimuth
              }
            });
          } else if (drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_CIRCULAR_RANGEFAN_AUTOSHAPE) {
            positions = [{
              latitude: lat,
              longitude: lon
            }];
            distance = [10000, 15000, 20000];
            milStdSymbol = new emp3.api.MilStdSymbol({
              name: symbol.description,
              symbolCode: symbolCode,
              positions: positions,
              modifiers: {
                distance: distance
              }
            });
          } else if (drawCategory === armyc2.c2sd.renderer.utilities.SymbolDefTable.DRAW_CATEGORY_TWO_POINT_RECT_PARAMETERED_AUTOSHAPE) {
            positions = this.createRandomPositions(2, lat, lon);
            distance = [10000];
            milStdSymbol = new emp3.api.MilStdSymbol({
              name: symbol.description,
              symbolCode: symbolCode,
              positions: this.convertPositionStringToGeoPositions(positions),
              modifiers: {
                distance: distance
              }
            });
          } else {
            symbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(symbol.symbolCode, this.state.symbolStandard);

            if (symbolDef) {
              positions = this.createRandomPositions(symbolDef.minPoints, lat, lon);
              milStdSymbol = new emp3.api.MilStdSymbol({
                name: symbol.description,
                symbolCode: symbolCode,
                positions: this.convertPositionStringToGeoPositions(positions)
              });
            }
          }

          symbolsList.push(milStdSymbol);

          lon += 0.1;
          if (lon > 30) {
            lon = 0;
            lat -= 1;
          }
        }
      } catch (err) {
        toastr.error(err.message, 'Draw All Symbols');
      }
    }

    addFeatures(symbolsList);

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});
    try {
      new Promise((resolve, reject) => {
        overlay.addFeatures({
          features: symbolsList,
          onSuccess: () => {
            toastr.success('Added All Symbols To Overlay');
            resolve();
          },
          onError: (err) => {
            toastr.error(JSON.stringify(err), 'Failed Add All Symbols To Overlay');
            reject();
          }
        });
      });
    } catch (err) {
      toastr.error(err.message, 'Draw All Symbols');
    }
  }

  plotSymbolGroup() {
    toastr.warning('plotSymbolGroup not implemented in this tool yet');
  }

  convertPositionStringToGeoPositions(coordinateString) {
    let i, len,
      positions = [],
      position, coordinate,
      coordinates = coordinateString.trim().split(' ');

    for (i = 0, len = coordinates.length; i < len; i++) {
      coordinate = coordinates[i].split(',');
      position = {};

      // skip any coordinates that only have one coordinate.
      if (coordinate.length === 2) {
        position.longitude = parseFloat(coordinate[0]);
        position.latitude = parseFloat(coordinate[1]);
        positions.push(position);
      } else if (coordinate.length >= 3) {
        position.longitude = parseFloat(coordinate[0]);
        position.latitude = parseFloat(coordinate[1]);
        position.altitude = parseFloat(coordinate[2]);
        positions.push(position);
      }
    }

    return positions;
  }

  /**
   * @param {boolean} silent will not display toastr message if set true
   * @throws Will throw an error if primitive constructor fails
   */
  createMilStdSymbol(silent) {
    const {addFeature, addResult, addError} = this.props;
    const args = {...this.state.symbol};

    args.name = args.name ? args.name : this.createId();
    args.geoId = args.geoId === "" ? undefined : args.geoId;

    if (this.state.symbol.positions.trim() === '') {
      args.positions = this.convertPositionStringToGeoPositions(this.createRandomPositions(this.state.symbolPoints.min));
    } else {
      args.positions = this.convertPositionStringToGeoPositions(this.state.symbol.positions);
    }

    let symbol;
    try {
      symbol = new emp3.api.MilStdSymbol(args);
      if (!silent) {
        toastr.success('Symbol Created Successfully');
      }
      addResult(args, 'createMilStdSymbol');
      addFeature(symbol);
    } catch (err) {
      addError(err.message, 'createMilStdSymbol');
      if (!silent) {
        toastr.error(err.message, 'Create Symbol Failed');
      }
      throw new Error(err.message);
    }
    return symbol;
  }

  createMilStdSymbolAddToOverlay() {
    const {overlays, addResult, addError} = this.props;
    if (this.state.selectedOverlayId === '') {
      toastr.warning('No overlay selected');
      return;
    }

    const overlay = _.find(overlays, {geoId: this.state.selectedOverlayId});

    try {
      const symbol = this.createMilStdSymbol(true);
      overlay.addFeatures({
        features: [symbol],
        onSuccess: (args) => {
          addResult(symbol, 'createMilStdAddToOverlay');
          toastr.success('MilStd Symbol Added To Overlay at ' + JSON.stringify(args.features));
        },
        onError: (err) => {
          addError(err, 'createPolygonAddToOverlay');
          toastr.error(JSON.stringify(err), 'Create MilStd Symbol Add To Overlay');
        }
      });
    } catch (err) {
      addError(err.message, 'createPolygonAddToOverlay:Critical');
      toastr.error(err.message, 'Create MilStd Symbol Add To Overlay:Critical');
    }
  }

  apply() {
    const {features} = this.props;
    let property,
      symbol = _.find(features, {geoId: this.state.symbol.geoId});

    if (!symbol) {
      toastr.error('No symbol found with the given id ' + this.state.symbol.geoId);
      return;
    }

    let props = {...this.state.symbol};
    props.name = this.state.symbol.name === '' ? undefined : this.state.symbol.name.trim();
    props.symbolCode = this.state.symbol.symbolCode;
    props.positions = this.convertPositionStringToGeoPositions(this.state.symbol.positions);
    props.symbolStandard = this.state.symbol.symbolStandard;

    for (property in props) {
      symbol[property] = props[property];
    }

    try {
      symbol.apply();
    } catch (err) {
      toastr.error(err.message, 'Create Symbol Add To Overlay:Critical');
    }
  }

  render() {
    const {overlays} = this.props;
    const _affiliation = _.map(AFFILIATION, (value, key) => {
      return {key: key, value: value};
    });
    const _status = _.map(STATUS, (value, key) => {
      return {key: key, value: value};
    });
    const _echelon = _.map(ECHELON, (value, key) => {
      return {key: key, value: value};
    });


    const symbolExplorerBlock = (<div className="mdl-cell mdl-cell--12-col mdl-grid">
      <label className="mdl-cell mdl-cell--3-col">Affiliation</label>
      <DropdownList className="mdl-cell mdl-cell--9-col"
                    defaultValue="Friendly"
                    data={_affiliation}
                    textField="value"
                    onChange={value => this.setState({affiliation: value.key}, this.updateSymbol)}/>

      <label className="mdl-cell mdl-cell--3-col">Status</label>

      <DropdownList className="mdl-cell mdl-cell--9-col"
                    defaultValue="Present"
                    data={_status}
                    textField="value"
                    onChange={value => this.setState({status: value.key}, this.updateSymbol)}/>

      <label className="mdl-cell mdl-cell--3-col">Echelon</label>
      <DropdownList className="mdl-cell mdl-cell--9-col"
                    defaultValue="Battalion"
                    data={_echelon}
                    textField="value"
                    onChange={value => this.setState({echelon: value.key}, this.updateSymbol)}/>

      <SymbolExplorer data={this.state.symbolDefs}
                      symbolStandard={this.state.symbolStandard}
                      className="mdl-cell mdl-cell--12-col"
                      affiliation={this.state.affiliation}
                      echelon={this.state.echelon}
                      status={this.state.status}
                      modifiers={this.state.symbol.modifiers}
                      updateCallback={this.updateSymbolCode}/>

      <button
        className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
        onClick={this.plotAllSymbols}>
        Draw All Symbols
      </button>
    </div>);

    return (
      <div>
        <span className='mdl-layout-title'>Create a MilStd Symbol</span>
        <div className='mdl-grid'>

          <VText id='createSymbol-name'
                 className="mdl-cell mdl-cell--12-col"
                 value={this.state.symbol.name}
                 callback={this.updateSymbolValues}
                 label='Name'/>

          <VText id='createSymbol-geoId'
                 className="mdl-cell mdl-cell--12-col"
                 value={this.state.symbol.geoId}
                 callback={this.updateSymbolValues}
                 label='GeoID'/>

          <VText id='createSymbol-symbolCode'
                 className="mdl-cell mdl-cell--8-col"
                 value={this.state.symbol.symbolCode}
                 callback={this.updateSymbolStringDirect}
                 label='symbolCode'/>

          <MilStdPreview symbol={this.state.symbol}
                         className="mdl-cell mdl-cell--4-col"/>

          <label className="mdl-cell mdl-cell--6-col">Symbol Standard</label>
          <DropdownList
            className="mdl-cell mdl-cell--6-col"
            defaultValue="2525c"
            data={["2525b", "2525c"]}
            onChange={value => this.updateSymbolStandard(value)}/>

          <VText id='createSymbol-positions'
                 className="mdl-cell mdl-cell--9-col"
                 value={this.state.symbol.positions}
                 callback={this.updateSymbolValues}
                 label='Positions'/>

          <button
            className='mdl-button mdl-js-button mdl-button--icon mdl-button--colored mdl-cell mdl-cell--1-col mdl-cell--middle'
            onClick={this.updatePositionsWithRandom} title='Generate random position'>
            <i className='fa fa-plus'/>
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createMilStdSymbol}>
            Create Symbol
          </button>

          <DropdownList data={overlays}
                        textField='name' valueField='geoId'
                        value={this.state.selectedOverlayId}
                        onChange={overlay => this.updateSelectedOverlay({target: {value: overlay.geoId}})}
                        className='mdl-cell mdl-cell--12-col'/>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.createMilStdSymbolAddToOverlay}>
            Create Symbol Add To Overlay
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.apply}>
            Update
          </button>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-cell mdl-cell--12-col'
            onClick={() => this.setState({showSymbolExplorer: !this.state.showSymbolExplorer})}>
            Toggle Symbol Explorer
          </button>

          {this.state.showSymbolExplorer ? symbolExplorerBlock : null}

          <PropertiesBox featureType={emp3.api.enums.FeatureTypeEnum.GEO_MIL_SYMBOL}
                         callback={this.updateProperties}
                         properties={this.state.symbol}/>

          <RelatedTests className='mdl-cell mdl-cell--12-col' relatedTests={[
            {text: 'Add this symbol to an overlay', target: 'deleteFeaturesTest'},
            {text: 'Add a child feature', target: 'featureAddFeatureTest'},
            {text: 'Clear child features', target: 'FeatureClearContainerTest'}
          ]}/>
        </div>
      </div>
    );
  }
}

CreateMilStdSymbolTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  addFeature: PropTypes.func.isRequired,
  addFeatures: PropTypes.func.isRequired,
  maps: PropTypes.array,
  features: PropTypes.array,
  overlays: PropTypes.array
};

const mapStateToProps = state => {
  return {
    maps: state.maps,
    features: state.features,
    overlays: state.overlays
  };
};

export default connect(mapStateToProps)(CreateMilStdSymbolTest);
