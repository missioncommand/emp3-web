import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {VText} from './shared';
import {connect} from 'react-redux';
import {selectTest} from '../actions/TestActions';
import {toggleGroup} from '../actions/ControlPanelActions';
import {TestManifest, findTestInManifest} from '../TestManifest';

const TEST_TO_PANEL_ANIMATION = 'testToPanel';
const PANEL_TO_TEST_ANIMATION = 'panelToTest';

//======================================================================================================================
let TestNotFound = ({dispatch, testStack}) => {
  return (
    <div className='mdl-layout__container'>
      <h4>Test Not Found</h4>
      <span className='mdl-layout-title'>{testStack.testStack[testStack.testStackIndex]}</span>
      <div className='mdl-grid'>
        <button
          className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect mdl-cell mdl-cell--12-col'
          onClick={() => {
            dispatch(selectTest(null));
          }}>
          <i className='fa fa-arrow-left'/> Back
        </button>
      </div>
    </div>
  );
};

TestNotFound.propTypes = {
  dispatch: PropTypes.func,
  testStack: PropTypes.shape({
    testStack: PropTypes.array.isRequired,
    testStackIndex: PropTypes.number.isRequired
  })
};

const mapTestNotFoundStateToProps = state => {
  return {
    testStack: state.testStack
  };
};

TestNotFound = connect(mapTestNotFoundStateToProps)(TestNotFound);

//======================================================================================================================
let CategoryHeader = ({dispatch, title, open, id}) => {
  let iconClass = classNames('fa', open ? 'fa-folder-open' : 'fa-folder');
  return (
    <div className='testEntry testEntryHeader'>
      <span onClick={() => {
        dispatch(toggleGroup(id));
      }}>
        <i className={iconClass}/> {title}
      </span>
    </div>
  );
};

CategoryHeader.propTypes = {
  dispatch: PropTypes.func,
  title: PropTypes.string.isRequired,
  open: PropTypes.bool,
  id: PropTypes.string.isRequired
};
CategoryHeader = connect()(CategoryHeader);

//======================================================================================================================
let TestEntry = ({dispatch, test}) => {
  return (
    <div className='testEntry testEntryTest' onClick={() => {
      dispatch(selectTest(test.id));
    }}>
      {test.key}
    </div>
  );
};

TestEntry.propTypes = {
  dispatch: PropTypes.func,
  test: PropTypes.shape({
    id: PropTypes.string,
    key: PropTypes.string
  }).isRequired
};
TestEntry = connect()(TestEntry);

//======================================================================================================================
let TestGroup = ({title, id, children, testGroupStates, searchFilter}) => {
  let renderedChildren = [];
  let isOpen = testGroupStates[id] || (searchFilter !== '');
  if (isOpen) {
    children.forEach(child => {

      if (child.hasOwnProperty('title')) {
        renderedChildren.push(<TestGroup key={child.title}
                                         id={child.id}
                                         title={child.title}
                                         children={child.children}
                                         searchFilter={searchFilter}/>);
      } else {
        let filtered = false;
        if (searchFilter !== '') {
          filtered = true;
          if (child.key.toLowerCase().contains(searchFilter)) {
            filtered = false;
          } else {
            let tagFound = false;
            _.each(child.tags, tag => {
              if (tag.toLowerCase().contains(searchFilter)) {
                tagFound = true;
              }
            });
            filtered = !tagFound;
          }
        }
        if (!filtered) {
          renderedChildren.push(<TestEntry key={child.id} test={child}/>);
        }
      }
    });
  }

  if (searchFilter !== '' && renderedChildren.length === 0) {
    return <div />;
  }
  return (
    <div>
      <CategoryHeader title={title} open={isOpen} id={id}/>
      <div style={{paddingLeft: '18px'}}>
        {renderedChildren}
      </div>
    </div>
  );
};

TestGroup.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.array,
  searchFilter: PropTypes.string,
  id: PropTypes.string.isRequired,
  testGroupStates: PropTypes.object
};

const mapTestGroupStateToProps = state => {
  return {
    testGroupStates: state.testGroupStates
  };
};

TestGroup = connect(mapTestGroupStateToProps)(TestGroup);

//======================================================================================================================
class ControlPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchFilter: ''
    };
  }

  componentDidUpdate() {
    // This upgrades all upgradable components (i.e. with 'mdl-js-*' class)
    componentHandler.upgradeDom();
  }

  render() {
    const {testStack} = this.props;

    const testGroups = _.map(TestManifest, group => {
      return <TestGroup key={group.id} id={group.id}
                        title={group.title}
                        children={group.children}
                        searchFilter={this.state.searchFilter}/>;
    });

    const activeTest = testStack.testStack[testStack.testStackIndex];
    let animation = PANEL_TO_TEST_ANIMATION;

    let testPanel = <TestNotFound />;
    if (activeTest !== null) {
      animation = TEST_TO_PANEL_ANIMATION;
      let test = findTestInManifest(activeTest);
      if (test) {
        testPanel = React.createElement(test.panel, this.props);
      }
    }

    const testSelection = (
      <div className='mdl-layout__content'>
        <VText id='searchFilter' label='Search by name or tag...' value={this.state.searchFilter}
               callback={event => this.setState({searchFilter: event.target.value.toLowerCase()})}/>
        {testGroups}
      </div>);

    return (
      <div id='controlPanel' className='mdl-layout__content'>
        <ReactCSSTransitionGroup
          transitionName={animation}
          transitionEnterTimeout={200}
          transitionLeaveTimeout={100}>
          {activeTest ? testPanel : testSelection}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

ControlPanel.propTypes = {
  testStack: PropTypes.shape({
    testStack: PropTypes.array,
    testStackIndex: PropTypes.number
  })
};

const mapStateToProps = state => {
  return {
    testGroupStates: state.testGroupStates,
    testStack: state.testStack
  };
};

export default connect(mapStateToProps)(ControlPanel);
