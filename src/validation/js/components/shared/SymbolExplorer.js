import * as React from 'react';
import {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {DragSource} from 'react-dnd';
import {DragItems, MILSTD_2525_POSITIONS} from '../../constants';
import {splice} from '../../util/Splice';
//======================================================================================================================
const nodeSource = {
  beginDrag: props => {

    let symbolCode = props.data.$.SYMBOLID.replace(/\*/g, '-');

    if (!armyc2.c2sd.renderer.utilities.SymbolUtilities.isWeather(symbolCode)) {
      symbolCode = splice(symbolCode, props.affiliation, MILSTD_2525_POSITIONS.IDENTITY);
      symbolCode = splice(symbolCode, props.echelon, MILSTD_2525_POSITIONS.MODIFIER_2);
      symbolCode = splice(symbolCode, props.status, MILSTD_2525_POSITIONS.STATUS);
    }

    return {
      symbolCode: symbolCode,
      symbolStandard: props.symbolStandard
    };
  }
};

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
};

class SymbolNode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      over: false
    };
  }

  render() {
    const {connectDragSource, modifiers, data, selectedNode, selectNode, affiliation, echelon, status, symbolStandard} = this.props;

    let folderClass = classNames(
      'fa', 'fa-2x',
      {'fa-folder-open': this.state.open},
      {'fa-folder': !this.state.open},
    );

    if (typeof data.SYMBOL === 'undefined') {
      folderClass = '';
    }

    let symbolImage;
    if (typeof data.$ !== 'undefined' && typeof data.$.SYMBOLID !== 'undefined') {
      let symbolCode = data.$.SYMBOLID.replace(/\*/g, '-');

      if (!armyc2.c2sd.renderer.utilities.SymbolUtilities.isWeather(symbolCode)) {
        symbolCode = splice(symbolCode, affiliation, MILSTD_2525_POSITIONS.IDENTITY);
        symbolCode = splice(symbolCode, echelon, MILSTD_2525_POSITIONS.MODIFIER_2);
        symbolCode = splice(symbolCode, status, MILSTD_2525_POSITIONS.STATUS);
      }
      modifiers.SYMSTD = (symbolStandard === '2525b' ? 0 : 1);

      symbolImage = armyc2.c2sd.renderer.MilStdIconRenderer.Render(symbolCode, modifiers);
      symbolImage = symbolImage.toDataUrl();
    }

    let liClass = classNames(
      'symbolExplorer-node'
    );

    let divClass = classNames(
      {'selectedNode': selectedNode === data},
      {'over': this.state.over}
    );

    let childNodes;
    if (this.state.open && data.SYMBOL) {
      childNodes = data.SYMBOL.map(symbol => {
        return <DragSymbolNode key={symbol.$.SYMBOLID}
                               symbolStandard={symbolStandard}
                               data={symbol}
                               echelon={echelon}
                               status={status}
                               modifiers={modifiers}
                               affiliation={affiliation}
                               selectedNode={selectedNode}
                               selectNode={selectNode}/>;
      });
    }

    return (
      <li className={liClass} style={{display: 'flex'}}>
        <div onClick={() => this.setState({open: !this.state.open})} style={{width: '30px'}}>
          <span><i className={folderClass}/></span>
        </div>

        <div>
          {connectDragSource(
            <div style={{margin: '0 0 0 6px'}} className={divClass}
                 onClick={() => selectNode(data)}
                 onMouseEnter={() => this.setState({over: true})}
                 onMouseLeave={() => this.setState({over: false})}>
              <img src={symbolImage}/>
              <span style={{padding: '8px'}}>{data.$.DESCRIPTION}</span>
            </div>)}

          <ul style={{listStyle: 'none', padding: 0, margin: '8px 0 0 6px'}}>
            {childNodes}
          </ul>
        </div>
      </li>
    );
  }
}

SymbolNode.propTypes = {
  data: PropTypes.shape({
    $: PropTypes.shape({
      DESCRIPTION: PropTypes.string.isRequired,
      SYMBOLID: PropTypes.string.isRequired
    }),
    SYMBOL: PropTypes.array
  }).isRequired,
  modifiers: PropTypes.object,
  affiliation: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  echelon: PropTypes.string.isRequired,
  isDragging: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  selectedNode: PropTypes.any,
  selectNode: PropTypes.func.isRequired,
  symbolStandard: PropTypes.string.isRequired
};

const DragSymbolNode = DragSource(DragItems.MIL_STD_SYMBOL, nodeSource, collect)(SymbolNode);
//======================================================================================================================
class SymbolExplorer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: null
    };
    this.selectNode = this.selectNode.bind(this);
    this.selectedSymbol = this.selectedSymbol.bind(this);
  }

  selectNode(node) {
    const {updateCallback} = this.props;
    this.setState({selectedNode: node}, () => {
      if (updateCallback) {
        updateCallback(this.state.selectedNode.$.SYMBOLID.replace(/\*/g, '-'));
      }
    });
  }

  selectedSymbol() {
    return this.state.selectedNode;
  }

  render() {
    let symbols;
    const {data, echelon, affiliation, status, modifiers, className, symbolStandard} = this.props;

    if (typeof data.SYMBOLEXPLORER !== 'undefined') {
      symbols = data.SYMBOLEXPLORER.SYMBOL;
    } else {
      symbols = data.SYMBOL;
    }

    let childNodes = symbols.map(symbol => {
      return <DragSymbolNode key={symbol.$.SYMBOLID}
                             symbolStandard={symbolStandard}
                             data={symbol}
                             echelon={echelon}
                             affiliation={affiliation}
                             status={status}
                             modifiers={modifiers}
                             selectedNode={this.state.selectedNode}
                             selectNode={this.selectNode}/>;
    });

    return (
      <div className={className}>
        <ul style={{listStyle: 'none', padding: 0, margin: '0 0 0 6px'}}>
          {childNodes}
        </ul>
      </div>
    );
  }
}

SymbolExplorer.propTypes = {
  className: PropTypes.string,
  data: PropTypes.object.isRequired,
  modifiers: PropTypes.object,
  affiliation: PropTypes.string,
  echelon: PropTypes.string,
  status: PropTypes.string,
  updateCallback: PropTypes.func,
  symbolStandard: PropTypes.string.isRequired
};

SymbolExplorer.defaultProps = {
  className: '',
  affiliation: '-',
  echelon: '-',
  status: '-',
  symbolStandard: '2525c'
};

export default SymbolExplorer;
