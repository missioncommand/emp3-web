import React, {Component, PropTypes} from 'react';
import ReactTooltip from 'react-tooltip';
import assign from 'object-assign';

//======================================================================================================================
class NavbarItem extends Component {
  render() {
    const {right, style, children} = this.props;

    const itemStyle = assign({}, style,
      {float: right ? 'right' : 'left'}
    );

    return (
      <div style={itemStyle}>
        {children}
      </div>
    );
  }
}

NavbarItem.propTypes = {
  style: PropTypes.object,
  right: PropTypes.any,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ])
};

NavbarItem.defaultProps = {
  style: {},
  right: false
};

//======================================================================================================================
let Separator = (right) => {
  return (
    <NavbarItem right={right}>
      |
    </NavbarItem>
  );
};

Separator.propTypes = {
  right: PropTypes.any
};

Separator.defaultProps = {
  right: false
};

//======================================================================================================================
class Navbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      goto: ''
    };
  }

  render() {
    const {clearTest, prevTest, nextTest, scripts, setActiveScript, executeScript, activeScript} = this.props;
    const {createOverlay, showResults, toggleSettings, isSettingsOpen, goto, addMapContainer, toggleAbout} = this.props;

    return (
      <div role='navigation' id='navbar'>
        <NavbarItem>
          <ul>
            <li onClick={clearTest}>
              <i data-tip data-for='homeBtn' className='fa fa-home' aria-hidden='true'/>
              <ReactTooltip id='homeBtn' place='bottom' delayShow={1000}>Home</ReactTooltip>
            </li>

            <li onClick={prevTest}>
              <i data-tip data-for='backBtn' className='fa fa-arrow-left' aria-hidden='true'/>
              <ReactTooltip id='backBtn' place='bottom'
                            delayShow={1000}>Previous Test</ReactTooltip>
            </li>

            <li onClick={nextTest}>
              <i data-tip data-for='fwdBtn' className='fa fa-arrow-right' aria-hidden='true'/>
              <ReactTooltip id='fwdBtn' place='bottom'
                            delayShow={1000}>Next Test</ReactTooltip>
            </li>
          </ul>
        </NavbarItem>

        <NavbarItem>
          <ul>
            {/* Button to add a new map container */}
            <li onClick={addMapContainer}>
              <i data-tip data-for='quickMapBtn' aria-hidden='true' className='fa fa-globe'/>
              <ReactTooltip id='quickMapBtn' place='bottom'
                            delayShow={1000}>Create a new map container</ReactTooltip>
            </li>

            {/* Button to add an overlay to the first map */}
            <li onClick={() => createOverlay()}>
              <i data-tip data-for='quickOverlayBtn' aria-hidden='true' className='fa fa-map-o'/>
              <ReactTooltip id='quickOverlayBtn' place='bottom'
                            delayShow={1000}>Add a quick overlay to the first map</ReactTooltip>
            </li>
          </ul>
        </NavbarItem>

        <NavbarItem right>
          <ul>
            <li title="About" onClick={toggleAbout}>
              <a href="#"><i className="fa fa-book"/></a></li>
          </ul>
        </NavbarItem>

        <Separator right/>

        <NavbarItem right>
          <ul>
            <li onClick={() => showResults()} title="Show Results">
              <i className='fa fa-arrow-down' aria-hidden='true'/> Results
            </li>
          </ul>
        </NavbarItem>

        <Separator right/>

        <NavbarItem right>
          <ul>
            <li onClick={() => toggleSettings()} style={{backgroundColor: isSettingsOpen ? 'cyan' : null}}
                title="Toggle Settings">
              <i className='fa fa-cog' aria-hidden='true'/> Settings
            </li>
          </ul>
        </NavbarItem>

        <Separator right/>

        <NavbarItem style={{padding: '3px 8px 0 0'}} right>
          <a style={{padding: '0 8px'}}
             title="Run Script"
             disabled={activeScript === ''}
             onClick={executeScript}
             href='#'><i className='fa fa-flash'/></a>
          <select value={activeScript}
                  style={{minWidth: '60px'}}
                  onChange={event => setActiveScript(event.target.value)}>
            <option value=''>No Script</option>
            {scripts.map(script => {
              return <option key={script.name}>{script.name}</option>;
            })}
          </select>
        </NavbarItem>

        <Separator right/>

        <NavbarItem style={{padding: '2px 8px 0 0'}} right>
          <form onSubmit={(event) => {
            event.preventDefault();
            goto(this.state.goto);
            return false;
          }}
                title="Go To Location"
                noValidate>
            <a href="#"
               style={{padding: '0 8px'}}
               onClick={() => goto(this.state.goto)}>
              <i className="fa fa-binoculars"/></a>
            <input id="quickGoto"
                   type="text"
                   placeholder="lon,lat,alt"
                   value={this.state.goto}
                   style={{width: "75px", textAlign: 'center'}}
                   onChange={event => this.setState({goto: event.target.value})}/>
          </form>
        </NavbarItem>

        <Separator right/>
      </div>
    );
  }
}

Navbar.propTypes = {
  clearTest: PropTypes.func,
  nextTest: PropTypes.func,
  prevTest: PropTypes.func,
  scripts: PropTypes.array,
  activeScript: PropTypes.string,
  setActiveScript: PropTypes.func.isRequired,
  executeScript: PropTypes.func.isRequired,
  addMapContainer: PropTypes.func.isRequired,
  createOverlay: PropTypes.func.isRequired,
  showResults: PropTypes.func.isRequired,
  toggleSettings: PropTypes.func.isRequired,
  toggleAbout: PropTypes.func.isRequired,
  isSettingsOpen: PropTypes.bool.isRequired,
  goto: PropTypes.func.isRequired
};

export default Navbar;
