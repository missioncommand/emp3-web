import {connect} from 'react-redux';
import {selectTest, clearTest} from '../actions/TestActions';
import RelatedTestsPanel from '../components/RelatedTestsPanel';

const mapStateToProps = state => {
  return {
    testGroupStates: state.testGroupStates,
    activeTest: state.activeTest
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setActiveTest: test => {
      dispatch(selectTest(test));
    },
    clearTest: () => {
      dispatch(clearTest());
    }
  };
};

const RelatedTests = connect(
  mapStateToProps,
  mapDispatchToProps
)(RelatedTestsPanel);

export default RelatedTests;