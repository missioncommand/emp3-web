import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {toggleInstructions} from '../../actions/InstructionsStateActions';

class Instructions extends Component {
  render() {
    const {content, testName, dispatch} = this.props;

    return (
      <div
        className='mdl-cell mdl-cell--12-col mdl-card mdl-shadow--2dp mdl-color--blue-grey-200 mdl-color-text--blue-grey-700'>
        <div className='mdl-card__title'>
          <h4 className='mdl-card__title-text'>Instructions</h4>
        </div>

        <div className='mdl-card__supporting-text'>
          {content}
        </div>

        <div className='mdl-card__actions'>
          <button
            onClick={() => dispatch(toggleInstructions(testName))}
            className='mdl-button mdl-js-button mdl-js-ripple-effect'>
            Hide
          </button>
        </div>
      </div>
    );
  }
}

Instructions.propTypes = {
  dispatch: PropTypes.func,
  content: PropTypes.node.isRequired,
  testName: PropTypes.string.isRequired
};

export default connect()(Instructions);

/**
 Move the cursor on the map
 <br/>
 Click to freeze pixel position
 <br/>
 Click again to un-freeze
 <hr/>
 <span style={{textAlign: 'center'}}>or</span>
 <hr/>
 Enter the desired pixel values manually.

 */