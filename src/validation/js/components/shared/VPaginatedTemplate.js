import React, {Component, PropTypes} from 'react';

class VPaginatedTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0
    };
    this.switchPage = this.switchPage.bind(this);
  }

  switchPage(page) {
    this.setState({currentPage: page});
  }

  render() {
    const {data, pageSize, template, callback} = this.props;

    const pageCount = Math.ceil(data.length / pageSize);
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
    pages.push(<li key={'page_first'} style={paginationStyle} onClick={this.switchPage.bind(this, 0)}>1</li>);

    const paginationMin = (Math.max(this.state.currentPage - 3, 1));
    const paginationMax = (Math.min(this.state.currentPage + 3, pageCount));

    if (paginationMin > 1) {
      pages.push(<li key={'page_firstBreak'} style={ellipsisStyle}><i className='fa fa-ellipsis-h'/></li>);
    }
    for (let p = paginationMin; p < paginationMax; p++) {
      pages.push(<li key={'page_' + p}
                     style={paginationStyle}
                     onClick={this.switchPage.bind(this, p)}>{p + 1}</li>);
    }

    if (pageCount > paginationMax) {
      pages.push(<li key={'page_lastBreak'} style={ellipsisStyle}><i className='fa fa-ellipsis-h'/></li>);
      pages.push(<li key={'page_last'}
                     style={paginationStyle}
                     onClick={this.switchPage.bind(this, pageCount)}>{pageCount + 1}</li>);
    }

    const windowMin = (this.state.currentPage * pageSize);
    const windowMax = (this.state.currentPage * pageSize) + pageSize - 1;

    return (
      <div className='mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col'>
        {data.map((item, i) => {
          if (i < windowMin || i > windowMax) {
            return;
          }
          return React.createElement(template, {key: i, data: item, callback: callback});
        })}

        {pageCount > 1 ? <div style={{textAlign: 'center', border: '1px solid black'}}>
          <ul style={{padding: 0, margin: 0}}>
            {pages}
          </ul>
        </div> : null}
      </div>
    );
  }
}

VPaginatedTemplate.propTypes = {
  callback: PropTypes.func,
  data: PropTypes.array.isRequired,
  pageSize: PropTypes.number,
  template: PropTypes.any.isRequired
};

VPaginatedTemplate.defaultProps = {
  pageSize: 5
};

export default VPaginatedTemplate;
