import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import {DropTarget} from 'react-dnd';
import {DragItems} from '../../constants/DragItems';

//======================================================================================================================
const spec = {
  drop: (props, monitor, component) => {
    if (monitor.didDrop()) {
      return;
    }

    const {addFeature, addOverlay, maps, id} = props;

    const clientOffset = monitor.getClientOffset();
    const componentRect = findDOMNode(component).getBoundingClientRect();
    const featureArgs = {...monitor.getItem()}; // use a copy

    /** @type emp3.api.Map */
    const map = _.find(maps, {container: id});

    let standard = featureArgs.symbolStandard || '2525c';
    let basicSymbol = armyc2.c2sd.renderer.utilities.SymbolUtilities.getBasicSymbolID(featureArgs.symbolCode, standard);
    let symbolDef = armyc2.c2sd.renderer.utilities.SymbolDefTable.getSymbolDef(basicSymbol, standard === '2525b' ? 0 : 1);

    let stepBounds = map.getBounds();
    let step = (stepBounds.east - stepBounds.west) / 10 || 1; //TODO bounds are currently missing for worldwind

    let origin = map.containerToGeo({
      x: clientOffset.x - componentRect.left,
      y: clientOffset.y - componentRect.top
    });

    featureArgs.positions = [origin];

    let nextPoint, finalPoint;

    if (symbolDef && symbolDef.maxPoints) {
      switch (Math.min(symbolDef.maxPoints, 5)) {
        case 5:
          for (let i = 1; i < 4; i++) {
            nextPoint = _.clone(origin);

            if (i%2 !== 0) {
              nextPoint.latitude += step;
            }

            nextPoint.longitude += i * step;
            featureArgs.positions.push(nextPoint);
          }
          finalPoint = _.clone(nextPoint);
          finalPoint.latitude -= 2 * step;
          featureArgs.positions.push(finalPoint);
          break;
        case 4:
        case 3:
        case 2:
        case 1:
        default:
          for (let i = 1; i < Math.min(symbolDef.maxPoints, 5); i++) {
            nextPoint = _.clone(origin);

            if (i%2 !== 0) {
              nextPoint.latitude += step;
            }

            nextPoint.longitude += i * step;
            featureArgs.positions.push(nextPoint);
          }
      }
    }

    // TODO check for type (primitives, features...)
    for (let prop in featureArgs) {
      if (featureArgs.hasOwnProperty(prop)) {
        if (featureArgs[prop] === '') {
          featureArgs[prop] = undefined;
        }
      }
    }

    let newFeature = new emp3.api.MilStdSymbol(featureArgs);

    const addFeatureToApp = () => {
      addFeature(newFeature);
    };

    map.getAllOverlays({
      onSuccess: (cbArgs) => {
        if (cbArgs.overlays.length) {
          // Just add it to the first overlay
          cbArgs.overlays[0].addFeature({
            feature: newFeature,
            onSuccess: addFeatureToApp
          });
        } else {
          let overlay = new emp3.api.Overlay({name: 'sandbox', geoId: 'sandbox_' + id});
          map.addOverlay({
            overlay: overlay,
            onSuccess: () => {
              addOverlay(overlay);
              overlay.addFeature({
                feature: newFeature,
                onSuccess: addFeatureToApp
              });
            }
          });
        }
      }
    });

    return {dropped: true};
  }
};

const collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

class Map extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    const {connectDropTarget, selectMap, id, style} = this.props;

    return (
      <div className="map"
           onMouseDown={selectMap.bind(this)}
           style={style}>
        {connectDropTarget(<div id={id}
                                style={{height: '100%', width: '100%'}}/>)}
      </div>
    );
  }
}

Map.propTypes = {
  selectMap: PropTypes.func,
  connectDropTarget: PropTypes.func,
  isOver: PropTypes.bool,
  canDrop: PropTypes.bool,
  style: PropTypes.object,
  id: PropTypes.string.isRequired,
  maps: PropTypes.array.isRequired,
  addFeature: PropTypes.func.isRequired,
  addOverlay: PropTypes.func.isRequired
};

Map.defaultProps = {
  style: {
    height: "100%",
    width: "100%"
  }
};


export default DropTarget(DragItems.MIL_STD_SYMBOL, spec, collect)(Map);
