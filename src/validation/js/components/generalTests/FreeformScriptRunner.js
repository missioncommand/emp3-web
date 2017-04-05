import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Modal from 'react-modal';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/jsx/jsx';
import CodeMirror from 'react-codemirror';
import {VText} from '../shared';
import {saveScript, deleteScript} from '../../actions/ScriptActions';

//======================================================================================================================
const modalStyle = {
  overlay: {
    zIndex: 9998,
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  },
  content: {
    backgroundColor: 'rgba(211,211,211, 0.8)',
    color: 'white',
    zIndex: 9999,
    border: '2px black'
  }
};

class ScriptsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: ''
    };
  }

  render() {
    const {isOpen, hideScriptsModal, scripts, deleteScript, loadScript} = this.props;

    return (
      <Modal
        id='resultsPanel'
        contentLabel="Scripts"
        isOpen={isOpen}
        onRequestClose={hideScriptsModal}
        style={modalStyle}>

        <div>
          <h3><span style={{color: 'black'}}>Scripts</span></h3>
          <span style={{fontSize: '0.8em', color: 'black'}}>DoubleClick or click and open</span>
        </div>
        <ul className='mdl-list'>
          {scripts.map(script => {
            return (
              <li key={script.name}
                  onClick={() => {
                    if (this.state.selected === script.name) {
                      this.setState({selected: ''});
                    } else {
                      this.setState({selected: script.name});
                    }
                  }}
                  onDoubleClick={() => {
                    this.setState({selected: ''}, () => {
                      loadScript(script.name);
                      hideScriptsModal();
                    });
                  }}
                  style={{backgroundColor: this.state.selected === script.name ? 'rgba(200,200,200,1)' : 'transparent'}}
                  className='mdl-list__item'>
                <span className='mdl-list__item-primary-content'>{script.name}</span>
                <span className='mdl-list__item-secondary-content'>
                  <button className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-list__item-secondary-action'
                          onClick={() => {
                            deleteScript(script.name);
                            this.setState({selected: ''});
                          }}>
                    <i className='fa fa-times'/>
                  </button>
                </span>
              </li>
            );
          })}
        </ul>

        <button className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored'
                disabled={this.state.selected === ''}
                onClick={() => {
                  loadScript(_.find(scripts, {name: this.state.selected}).name);
                  this.setState({selected: ''}, hideScriptsModal());
                }}>
          Load Script
        </button>
      </Modal>
    );
  }
}

ScriptsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  hideScriptsModal: PropTypes.func.isRequired,
  scripts: PropTypes.array.isRequired,
  deleteScript: PropTypes.func,
  loadScript: PropTypes.func.isRequired
};

ScriptsModal.defaultProps = {
  isOpen: false
};

//======================================================================================================================
class FreeformScriptRunner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      script: 'toastr.info(map0.geoId);',
      showScriptsModal: false,
      codeOptions: {
        mode: 'jsx',
        lineNumbers: true,
        tabSize: 2
      }
    };

    this.execute = this.execute.bind(this);
    this.newScript = this.newScript.bind(this);
    this.saveScript = this.saveScript.bind(this);
    this.loadScript = this.loadScript.bind(this);
    this.deleteScript = this.deleteScript.bind(this);
  }

  execute() {
    const {maps} = this.props;
    let script = _.clone(this.state.script);

    let match, replacement, foundObject;
    const objectHash = {};

    let mapPattern = /map([0-3])\./;

    while (mapPattern.test(script)) {
      match = script.match(mapPattern);
      foundObject = _.find(maps, {container: 'map' + match[1]});
      if (foundObject) {
        replacement = 'map' + match[1];
        objectHash[replacement] = foundObject;
        script = script.replace(mapPattern, 'objectHash["' + replacement + '"].');
      } else {
        toastr.error('Could not find specified map');
        return;
      }
    }

    try {
      eval(script);
    } catch (err) {
      toastr.error(err.message, 'Failed executing script');
      console.error(err);
    }
  }

  saveScript() {
    const {saveScript} = this.props;
    saveScript(this.state.name, this.state.script);
    toastr.success('Saved ' + this.state.name);
  }

  newScript() {
    this.setState({script: '', name: ''});
  }

  loadScript(name) {
    const {scripts} = this.props;
    const script = _.find(scripts, {name: name});
    this.setState({script: script.script, name: script.name});
  }

  deleteScript(name) {
    const {deleteScript} = this.props;
    deleteScript(name);
    this.setState({script: '', name: ''});
  }

  render() {
    const {scripts} = this.props;

    return (
      <div>
        <ScriptsModal isOpen={this.state.showScriptsModal}
                      hideScriptsModal={() => this.setState({showScriptsModal: false})}
                      scripts={scripts}
                      deleteScript={this.deleteScript}
                      loadScript={this.loadScript}/>

        <span className='mdl-layout-title'>Freeform Scripting</span>
        <div className='mdl-grid'>
          <div className='mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no-spacing'>
            <span className='mdl-layout-title'>EMP3 Object Access</span>
            <div className='mdl-cell mdl-cell--12-col'>
              Using maps <br/>
              <span style={{fontStyle: 'italic'}}>map0.getInstanceVisibility(...</span><br/>
              <span style={{fontStyle: 'italic'}}>map0, map1, map2, map3 are valid</span>
            </div>
            <div className='mdl-cell mdl-cell--12-col'>
              Using overlays/features <br/>
              <span style={{fontStyle: 'italic'}}>var f = _.find(this.props.features, {'{'}geoId: ...{'}'});</span><br/>
              <span style={{fontStyle: 'italic'}}>var o = _.find(this.props.overlays, {'{'}geoId: ...{'}'});</span>
            </div>
          </div>

          <VText id='script-name'
                 label='Script Name'
                 value={this.state.name}
                 callback={event => this.setState({name: event.target.value})}
                 classes={['mdl-cell', 'mdl-cell--12-col']}/>

          <div className='mdl-cell mdl-cell--12-col'>
            <CodeMirror value={this.state.script}
                        onChange={code => this.setState({script: code})}
                        options={this.state.codeOptions}/>
          </div>

          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--colored mdl-cell mdl-cell--12-col'
            onClick={this.execute}>
            <i className='fa fa-flash'/> Execute
          </button>

          <hr/>

          <div className='mdl-cell mdl-cell--12-col'>
            <button id='newScriptBtn'
                    className='mdl-button mdl-js-button'
                    onClick={this.newScript}>
              <i className='fa fa-file-code-o'/>
            </button>
            <div className='mdl-tooltip' data-mdl-for='newScriptBtn'>
              New Script
            </div>

            <button id='openScriptBtn'
                    className='mdl-button mdl-js-button'
                    onClick={() => this.setState({showScriptsModal: true})}>
              <i className='fa fa-folder-open-o'/>
            </button>
            <div className='mdl-tooltip' data-mdl-for='openScriptBtn'>
              Load Script
            </div>

            <button id='saveScriptBtn'
                    className='mdl-button mdl-js-button'
                    disabled={this.state.name === ''}
                    onClick={this.saveScript}>
              <i className='fa fa-floppy-o'/>
            </button>
            <div className='mdl-tooltip' data-mdl-for='saveScriptBtn'>
              Save Script
            </div>

          </div>
        </div>
      </div>
    )
      ;
  }
}

FreeformScriptRunner.propTypes = {
  maps: PropTypes.array,
  scripts: PropTypes.array,
  saveScript: PropTypes.func,
  deleteScript: PropTypes.func,
  addResult: PropTypes.func,
  addError: PropTypes.func
};

const mapStateToProps = state => {
  return {
    scripts: state.scripts
  };
};

const mapDispatchToProps = dispatch => {
  return {
    saveScript: (name, script) => {
      dispatch(saveScript(name, script));
    },
    deleteScript: (name) => {
      dispatch(deleteScript(name));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FreeformScriptRunner);
