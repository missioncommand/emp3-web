import React, {Component, PropTypes} from 'react';
import {DragSource} from 'react-dnd';
import {DragItems} from '../../constants';
const SYMBOL_LENGTH = 15;

const dragSource = {
  beginDrag: props => {
    return props.symbol;
  }
};

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
};

class MilStdPreview extends Component {
  render() {
    const {connectDragSource, className, symbol} = this.props;

    let preppedSymbolCode = symbol.symbolCode.replace(/\*/g, '-'),
      symbolImage = '',
      content;

    if (preppedSymbolCode.length === SYMBOL_LENGTH) {
      symbol.modifiers.SYMSTD = symbol.symbolStandard === '2525b' ? 0 : 1;
      symbolImage = armyc2.c2sd.renderer.MilStdIconRenderer.Render(preppedSymbolCode, symbol.modifiers);
      symbolImage = symbolImage.toDataUrl();
      content = connectDragSource(<img src={symbolImage}/>);
    } else {
      content = <span style={{fontSize: "0.7em", fontStyle: "italic"}}>Preview</span>;
    }

    return (
      <div className={className} style={{
        border: '1px dashed rgba(0,0,0,0.5)',
        boxShadow: 'inset 0 0 8px black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{maxWidth: '50%'}}>
          {content}
        </div>
      </div>
    );
  }
}

MilStdPreview.propTypes = {
  connectDragSource: PropTypes.func,
  className: PropTypes.string,
  symbol: PropTypes.object.isRequired
};

MilStdPreview.defaultProps = {
  className: ''
};

export default DragSource(DragItems.MIL_STD_SYMBOL, dragSource, collect)(MilStdPreview);
