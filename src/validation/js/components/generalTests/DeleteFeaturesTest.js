import * as React from 'react';
import {Component, PropTypes} from 'react';
import RelatedTests from '../../containers/RelatedTests';

class DeleteFeaturesTest extends Component {
  constructor(props) {
    super(props);

    let selectedFeatures = [];
    props.features.forEach(feature => {
      selectedFeatures[feature.geoId] = false;
    });

    this.state = {
      selectedOverlayId: '',
      selectedFeatures: selectedFeatures,
      filteredFeatures: [...props.features]
    };

    this.deleteSelectedFeatures = this.deleteSelectedFeatures.bind(this);
    this.deleteAllFeatures = this.deleteAllFeatures.bind(this);
    this.toggleFeatureSelect = this.toggleFeatureSelect.bind(this);
    this.updateSelectedOverlay = this.updateSelectedOverlay.bind(this);
  }

  componentWillReceiveProps(props) {
    let selectedFeatures = [];
    props.features.forEach(feature => {
      if (!_.includes(props.features, feature.geoId)) {
        selectedFeatures[feature.geoId] = false;
      }
    });

    let filteredFeatures = [...props.features];
    if (this.state.selectedOverlayId !== '') {
      const overlay = _.find(props.overlays, {geoId: this.state.selectedOverlayId});
      overlay.getFeatures({
        onSuccess: cbArgs => {
          this.setState({
            selectedFeatures: selectedFeatures,
            filteredFeatures: cbArgs.features
          });
        },
        onError: err => {
          this.props.addError(err, 'getFeatures');
          toastr.error('Could not get features for overlay');
        }
      });
    } else {
      this.setState({selectedFeatures: selectedFeatures,
        filteredFeatures: filteredFeatures
      });
    }
  }

  componentDidUpdate() {
    componentHandler.upgradeDom();
  }

  updateSelectedOverlay(event) {
    // Deselect them all
    let selectedFeatures = {};
    this.props.features.forEach(feature => {
      selectedFeatures[feature.geoId] = false;
    });

    this.setState({
      selectedOverlayId: event.target.value,
      selectedFeatures: selectedFeatures
    }, () => {
      let filteredFeatures = [...this.props.features];
      if (this.state.selectedOverlayId !== '') {
        let overlay = _.find(this.props.overlays, {geoId:this.state.selectedOverlayId});
        overlay.getFeatures({
          onSuccess: (cbArgs) => {
            filteredFeatures = cbArgs.features;
            this.setState({filteredFeatures: filteredFeatures});
          },
          onError: err => {
            toastr.error('Failed to get Features for Overlay');
            this.props.addError(err, 'overlay.getFeatures');
            this.setState({
              selectedOverlayId: '',
              filteredFeatures: [...this.props.features]});
          }
        });
      } else {
        this.setState({filteredFeatures: filteredFeatures});
      }
    });
  }

  toggleFeatureSelect(geoId) {
    let selectedFeatures = {...this.state.selectedFeatures};
    selectedFeatures[geoId] = !selectedFeatures[geoId];
    this.setState({selectedFeatures: selectedFeatures});
  }

  deleteSelectedFeatures() {
    let featuresToDelete = [];
    _.each(this.state.selectedFeatures, (selected, feature) => {
      if (selected) {
        featuresToDelete.push(_.find(this.props.features, {geoId: feature}));
      }
    });

    if (this.state.selectedOverlayId === '') {
      let promises = [];
      this.props.overlays.forEach(overlay => {
        promises.push(new Promise((resolve, reject) => {
          overlay.removeFeatures({
            features: featuresToDelete,
            onSuccess: () => {
              resolve();
            },
            onError: (err) => {
              reject(err);
            }
          });
        }));
      });

      Promise.all(promises)
      .then(() => {
        this.props.removeFeatures(featuresToDelete);
        toastr.success('Successfully Removed Features');
      })
      .catch(err => {
        this.props.addError(err, 'deleteFeatures');
        toastr.error('Failed to delete features');
      });

    } else {
      let overlay = _.find(this.props.overlays, {geoId: this.state.selectedOverlayId});
      overlay.removeFeatures({
        features: featuresToDelete,
        onSuccess: () => {
          toastr.success('Deleted the Selected Features');
        },
        onError: () => {
          toastr.error('Failed to Delete the Selected Features');
        }
      });
    }
  }

  deleteAllFeatures() {
    let promises = [];
    let featuresToDelete = this.props.features;
    this.props.overlays.forEach(overlay => {
      promises.push(new Promise((resolve, reject) => {
        overlay.removeFeatures({
          features: featuresToDelete,
          onSuccess: () => {
            resolve();
          },
          onError: (err) => {
            reject(err);
         }
        });
      }));
    });

    Promise.all(promises)
    .then(() => {
      this.props.clearFeatures();
      toastr.success('Successfully Removed Features');
    })
    .catch(err => {
      //this.props.addError(err, 'deleteFeatures');
      window.console.error(err);
      toastr.error('Failed to delete features');
    });
  }

  render() {
    return (
      <div>
        <h3>Remove Features</h3>

        <div>
          <h5>Existing Features</h5>
          <div style={{margin: '0 0 8px 0'}}>
            <label style={{margin: '0 6px 0 0'}} htmlFor='overlay-select'>Delete from </label>
            <select id='overlay-select' value={this.state.selectedOverlayId} onChange={this.updateSelectedOverlay}>
              <option value=''>All Overlays</option>
              {this.props.overlays.map((overlay, i) => {
                return <option key={overlay.geoId + '__' + i} value={overlay.geoId}>{overlay.name}</option>;
              })}
            </select>
          </div>

          <div style={{maxHeight: '500px', overflowY:'auto'}}>
            <ul style={{listDisplay:'none', margin: 0, padding: 0}}>
              {this.state.filteredFeatures.map((feature, i) => {
                if (i > 100) {
                  return null;
                }
                return (
                  <li key={feature.geoId + '_' + i}>
                    <label className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" htmlFor={feature.geoId + '_' + i}>
                      <input type="checkbox" id={feature.geoId + '_' + i} className="mdl-checkbox__input"
                             onClick={() => {this.toggleFeatureSelect(feature.geoId);}} checked={this.state.selectedFeatures[feature.geoId]}/>
                      <span className="mdl-checkbox__label">{feature.name ? feature.name : 'unnamed feature'}</span>
                    </label>
                    <div style={{margin:'0 0 0 24px'}}>
                      <span>{feature.name}</span> <span style={{fontStyle:'italic'}}>{feature.geoId}</span>
                    </div>
                  </li>);
              })}
              {this.state.filteredFeatures.length === 0 ? <li className='mdl-list__item'>
                <span className='mdl-list__item-primary-content'>No Features Exist On This Overlay</span>
              </li> : null}
            </ul>
          </div>
        </div>

        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.deleteSelectedFeatures} disabled={this.props.features.length === 0}>
          Delete Selected Features
        </button>

        <button
          className='blocky addButton mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
          onClick={this.deleteAllFeatures} disabled={this.props.features.length === 0}>
          Delete All Features
        </button>

        <RelatedTests relatedTests={[
          {text: 'Create Polygon', target: 'createPolygonTest'}
        ]}/>

      </div>
    );
  }
}

DeleteFeaturesTest.propTypes = {
  addResult: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  features: PropTypes.array.isRequired,
  overlays: PropTypes.array.isRequired,
  removeFeature: PropTypes.func.isRequired,
  removeFeatures: PropTypes.func.isRequired,
  clearFeatures: PropTypes.func.isRequired
};

export default DeleteFeaturesTest;
