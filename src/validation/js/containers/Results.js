import {connect} from 'react-redux';
import {removeResult, clearResults} from '../actions/ResultActions';
import ResultsPanel from '../components/ResultsPanel';

const mapStateToProps = state => {
  return {
    results: state.results
  };
};

const mapDispatchToProps = dispatch => {
  return {
    removeResult: idx => {
      dispatch(removeResult(idx));
    },
    clearResults: () => {
      dispatch(clearResults());
    }
  };
};

const Results = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResultsPanel);

export default Results;