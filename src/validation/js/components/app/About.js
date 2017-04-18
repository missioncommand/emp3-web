import * as React from 'react';
import {Component, PropTypes} from 'react';
import Modal from 'react-modal';

class Attribution extends Component{
  render() {
    const {text} = this.props;
    return (
      <li className="mdl-list__item">
        <span className="mdl-list__item-primary-content">{text}</span>
      </li>
    );
  }
}

Attribution.propTypes = {
  text: PropTypes.string.isRequired
};

const aboutStyle = {
  overlay: {
    zIndex: 9998,
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  },
  content: {
    backgroundColor: 'dimGray',
    color: 'white',
    zIndex: 9999,
    border: '2px black'
  }
};

class About extends Component {
  render() {
    const {isOpen, close} = this.props;

    return (
      <Modal
        id='aboutPanel'
        contentLabel="About"
        isOpen={isOpen}
        onRequestClose={close}
        style={aboutStyle}>

        <div>
          <span className="mdl-layout-title">About</span>

          <ul className="mdl-list">
            <Attribution text="Validation Tool powered by React"/>
            <Attribution text="Look and Feel by Material Design Lite"/>
            <Attribution text="Fonts and Icons by Font Awesome"/>
            <Attribution text="Favicon by Icons8"/>
          </ul>
        </div>
      </Modal>
    );
  }
}

About.propTypes = {
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool
};

export default About;
