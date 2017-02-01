import React, {Component, PropTypes} from 'react';
import {VText} from './shared';

//======================================================================================================================
let StorageEntry = ({entry}) => {

  const properties = [];
  for (let prop in entry) {
    if (entry.hasOwnProperty(prop)) {
      let value = entry[prop];
      if (typeof value === 'undefined') {
        value = '`undefined`';
      } else if (typeof value === 'boolean') {
        value = value.toString();
      } else if (value === '') {
        value = '<empty\>';
      }

      if (typeof value === 'object') {
        if (prop === 'childObjects') {
          properties.push(<div key={Math.random()} className='mdl-grid mdl-grid--no-spacing'>
            <div className='mdl-cell mdl-cell--3-col'>{prop}</div>
            <div className='mdl-cell mdl-cell--9-col'>
              {_.map(entry[prop], linkedObject => {
                return <div>{linkedObject.options.coreId}</div>;
              })}
            </div>
          </div>);
        } else if (prop === 'parentObjects') {
          properties.push(<div key={Math.random()} className='mdl-grid mdl-grid--no-spacing'>
            <div className='mdl-cell mdl-cell--3-col'>{prop}</div>
            <div className='mdl-cell mdl-cell--9-col'>
              {_.map(entry[prop], linkedObject => {
                return (<div key={Math.random()}>
                  {linkedObject.options.parentStorageEntry.options.coreId}</div>);
              })}
            </div>
          </div>);
        } else {
          properties.push(<div key={Math.random()} className='mdl-grid mdl-grid--no-spacing'>
            <div className='mdl-cell mdl-cell--3-col'>{prop}</div>
            <div className='mdl-cell mdl-cell--9-col'>TODO</div>
          </div>);
        }
      } else {
        properties.push(<div key={Math.random()} className='mdl-grid mdl-grid--no-spacing'>
          <div className='mdl-cell mdl-cell--3-col'>{prop}</div>
          <div className='mdl-cell mdl-cell--9-col'>{value}</div>
        </div>);
      }
    }
  }

  return (
    <div className='mdl-shadow--2dp'>

      <div className='mdl-grid'>
        <div className='mdl-cell mdl-cell--6-col'>Name: {entry.name}</div>
        <div className='mdl-cell mdl-cell--6-col'>CoreId: {entry.coreId}</div>
      </div>
      <div className='mdl-grid'>
        <div className='mdl-cell mdl-cell--12-col'>Description: {entry.description}</div>
      </div>

      <div className='mdl-grid'>
        <div className='mdl-cell mdl-cell--6-col'>
          {_.filter(properties, (prop, idx) => {
            return idx % 2 === 0;
          })}
        </div>
        <div className='mdl-cell mdl-cell--6-col'>
          {_.filter(properties, (prop, idx) => {
            return (idx + 1) % 2 === 0;
          })}
        </div>
      </div>
    </div>
  );
};

StorageEntry.propTypes = {
  entry: PropTypes.object.isRequired
};

//======================================================================================================================
class EMPStorageStructure extends Component {
  constructor(props) {
    super(props);

    this.state = {
      typeFilter: '',
      searchFilter: ''
    };

    this.updateStore = this.updateStore.bind(this);
  }

  updateStore() {
    this.forceUpdate();
  }

  render() {

    return (
      <div>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--2-col'>
            <button className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised'
                    onClick={this.updateStore}><i className='fa fa-refresh'/> Refresh
            </button>
          </div>
          <div className='mdl-cell mdl-cell--6-col'>
            <VText id='searchFilter' label='Filter by name or coreId...' value={this.state.searchFilter}
                   callback={event => this.setState({searchFilter: event.target.value})}/>
          </div>
          <div className='mdl-cell mdl-cell--4-col'>
            <label htmlFor='typeSelect'>Show </label>
            <select id='typeSelect' value={this.state.typeFilter} onChange={event => this.setState({typeFilter: event.target.value.toLowerCase()})}>
              <option value=''>All</option>
              <option value='static'>Static</option>
              <option value='overlay'>Overlay</option>
              <option value='feature'>Feature</option>
              <option value='wms'>WMS</option>
            </select>
          </div>
        </div>

        {_.map(emp.storage._storage.store, entry => {
          let filtered = false;

          if (this.state.searchFilter !== '') {
            filtered = !(entry.options.name.toLowerCase().contains(this.state.searchFilter.toLowerCase()) || entry.options.coreId.toLowerCase().contains(this.state.searchFilter.toLowerCase()));
          }
          if (this.state.typeFilter !== '') {
            filtered = (this.state.typeFilter !== entry.options.coreObjectType);
          }
          return filtered ? null : <StorageEntry key={entry.options.coreId} entry={entry.options}/>;
        })}
      </div>
    );
  }
}

export default EMPStorageStructure;
