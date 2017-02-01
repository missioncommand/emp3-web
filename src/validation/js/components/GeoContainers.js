import React, {Component, PropTypes} from 'react';

class GeoContainer extends Component {
  render() {
    const {container} = this.props;

    return (
      <div className='mdl-cell mdl-cell--4-col mdl-card mdl-shadow--2dp'>
        <div className='mdl-card__title mdl-card--expand'>
          <h2 className='mdl-card__title-text'>
            {container.name} <br/>
            <span style={{fontSize:'0.7em'}}>{container.geoId}</span>
          </h2>
        </div>
        <div className='mdl-card__supporting-text'>
          {container.description}
        </div>
      </div>
    );
  }
}

GeoContainer.propTypes = {
  container: PropTypes.object.isRequired
};

class GeoContainers extends Component {
  render() {
    const {containers} = this.props;
    const children = containers.map(container => {
      return <GeoContainer key={container.geoId} container={container}/>;
    });

    return (
      <div className='mdl-grid'>
        {_.filter(children, (child, index) => {
          return (index + 0) % 3 === 0;
        })}

        {_.filter(children, (child, index) => {
          return (index + 1) % 3 === 0;
        })}

        {_.filter(children, (child, index) => {
          return (index + 2) % 3 === 0;
        })}
      </div>
    );
  }
}

GeoContainers.propTypes = {
  containers: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    geoId: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string
  }))
};

export default GeoContainers;
