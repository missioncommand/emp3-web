import React, {Component, PropTypes} from 'react';

class VPaginatedList extends Component {
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
    const {items, pageSize, callback} = this.props;

    const pageCount = Math.ceil(items.length / pageSize);
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
      <div>
        <ul className='mdl-list'>
          {items.map((item, i) => {
            if (i < windowMin || i > windowMax) {
              return;
            }

            return (<li key={'item_' + i} className='mdl-list__item mdl-list__item--two-line'>
              <span className='mdl-list__item-primary-content'>{item.geoId}</span>
              {callback ? <span className='mdl-list__item-secondary-content'>
                <button className='mdl-button mdl-button--colored mdl-js-button mdl-list__item-secondary-action'
                        onClick={callback.bind(this, item.geoId)}>
                  <i className='fa fa-plus'/>
                </button>
              </span> : null}
            </li>);
          })}
        </ul>
        {pageCount > 1 ? <div style={{textAlign: 'center', border: '1px solid black'}}>
          <ul style={{padding: 0, margin: 0}}>
            {pages}
          </ul>
        </div> : null}
      </div>
    );
  }
}

VPaginatedList.propTypes = {
  callback: PropTypes.func,
  items: PropTypes.array,
  pageSize: PropTypes.number
};

VPaginatedList.defaultProps = {
  items: [],
  pageSize: 5
};

export default VPaginatedList;
