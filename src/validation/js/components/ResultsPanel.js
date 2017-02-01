import React, {Component, PropTypes} from 'react';
import Modal from 'react-modal';
import JSONTree from 'react-json-tree';
import classNames from 'classnames';

const modalStyle = {
  overlay: {
    zIndex: 9998,
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  },
  content: {
    backgroundColor: 'dimGray',
    color: 'white',
    zIndex: 9999,
    border: '2px black'
  }
};

const theme = {
  scheme: 'google',
  author: 'seth wright (http://sethawright.com)',
  base00: '#1d1f21',
  base01: '#282a2e',
  base02: '#373b41',
  base03: '#969896',
  base04: '#b4b7b4',
  base05: '#c5c8c6',
  base06: '#e0e0e0',
  base07: '#ffffff',
  base08: '#CC342B',
  base09: '#F96A38',
  base0A: '#FBA922',
  base0B: '#198844',
  base0C: '#3971ED',
  base0D: '#3971ED',
  base0E: '#A36AC7',
  base0F: '#3971ED'
};

class ResultsPanel extends Component {
  constructor() {
    super();

    this.state = {
      currentPage: 0,
      pageSize: 10
    };

    this.switchPage = this.switchPage.bind(this);
    this.exportResults = this.exportResults.bind(this);
  }

  exportResults() {
    let dataStr = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({results:this.props.results}, 0, 2));
    const dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "results.json");
    dlAnchorElem.click();
  }

  switchPage(page) {
    this.setState({currentPage: page});
  }

  render() {

    const pageCount = Math.ceil(this.props.results.length / this.state.pageSize);
    const pages = [];

    const paginationStyle = {
      display: 'inline',
      cursor: 'pointer',
      margin: '3px',
      padding: '2px',
      textAlign: 'center',
      borderRight: '1px solid rgba(0,0,0,0.25)'
    };

    const ellipsisStyle = {
      display: 'inline',
      margin: '3px',
      padding: '2px',
      textAlign: 'center',
      borderRight: '1px solid rgba(0,0,0,0.25)'
    };
    let pageStyle = {...paginationStyle};
    if (this.state.currentPage === 0) {
      pageStyle.color = 'red';
    }
    pages.push(<li key={'page_first'} style={pageStyle} onClick={this.switchPage.bind(this, 0)}>1</li>);

    const paginationMin = (Math.max(this.state.currentPage - 3, 1));
    const paginationMax = (Math.min(this.state.currentPage + 3, pageCount));

    if (paginationMin > 1) {
      pages.push(<li key={'page_firstBreak'} style={ellipsisStyle}><i className='fa fa-ellipsis-h'/></li>);
    }

    for (let p = paginationMin; p < paginationMax; p++) {
      pageStyle = {...paginationStyle};
      if (p === this.state.currentPage) {
        pageStyle.color = 'red';
      }
      pages.push(<li key={'page_' + p}
                     style={pageStyle}
                     onClick={this.switchPage.bind(this, p)}>{p + 1}</li>);
    }

    if (pageCount > paginationMax) {
      pages.push(<li key={'page_lastBreak'} style={ellipsisStyle}><i className='fa fa-ellipsis-h'/></li>);
      pages.push(<li key={'page_last'}
                     style={paginationStyle}
                     onClick={this.switchPage.bind(this, pageCount)}>{pageCount + 1}</li>);
    }

    const windowMin = (this.state.currentPage * this.state.pageSize);
    const windowMax = (this.state.currentPage * this.state.pageSize) + this.state.pageSize - 1;

    return (
      <Modal
        id='resultsPanel'
        isOpen={this.props.isResultsOpen}
        onRequestClose={this.props.hideResults}
        style={modalStyle}>
        <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect'
                onClick={this.props.clearResults}>Clear All Results
        </button>

        <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect'
                style={{float: 'right'}}
                onClick={this.exportResults}>
          Export
        </button>
        <a id='downloadAnchorElem'></a>

        {pageCount > 1 ? <div style={{textAlign: 'center', border: '1px solid black'}}>
          <ul style={{padding: 0, margin: 0}}>
            {pages}
          </ul>
        </div> : null}

        <div>
          <ul style={{listStyle: 'none', padding: 0, margin: '5px 0 0 0'}}>
            {this.props.results.map((result, i) => {
              if (i < windowMin || i > windowMax) {
                return;
              }

              let cn = classNames('result', (result.isError ? 'error' : 'success'));
              if (typeof result.result === 'string') {
                result.result = {data: result.result};
              }

              return (
                <li key={i}>
                  <div className={cn}>
                  <span className='closeBtn'>
                    <i className='fa fa-2x fa-times-circle-o' onClick={this.props.removeResult.bind(this, i)}/>
                  </span>
                    <div><span style={{textDecoration: 'underline'}}>{result.source}</span></div>
                    <JSONTree data={result.result} theme={theme} isLightTheme={false}/>
                  </div>
                </li>);
            })}
          </ul>
        </div>
      </Modal>
    );
  }
}

ResultsPanel.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.any,
    isError: PropTypes.bool.isRequired,
    result: PropTypes.any.isRequired
  }).isRequired).isRequired,
  isResultsOpen: PropTypes.bool.isRequired,
  hideResults: PropTypes.func.isRequired,
  clearResults: PropTypes.func.isRequired,
  removeResult: PropTypes.func.isRequired
};

ResultsPanel.defaultProps = {
  results: []
};

export default ResultsPanel;
