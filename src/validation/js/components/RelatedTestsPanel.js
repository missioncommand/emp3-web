import React, {Component, PropTypes} from 'react';

class RelatedTestsPanel extends Component {

  render() {
    return (
      <div className='selectionPanel'>
        <h4>What would you like to do next?</h4>
        <ul>
          {this.props.relatedTests.map((test, i) => {
            let li = <li key={i} className='notImplemented'>{test.text}</li>;
            if (test.target) {
              li = <li onClick={this.props.setActiveTest.bind(this, test.target)} key={i}>{test.text}</li>;
            }
            return li;
          })}
        </ul>
      </div>
    );
  }
}

RelatedTestsPanel.propTypes = {
  relatedTests: PropTypes.arrayOf(PropTypes.shape({
    target: PropTypes.string,
    text: PropTypes.string.isRequired
  }).isRequired).isRequired,
  setActiveTest: PropTypes.func.isRequired
};

RelatedTestsPanel.defaultProps = {
  relatedTests: []
};

export default RelatedTestsPanel;