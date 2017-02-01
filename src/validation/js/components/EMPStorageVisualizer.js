import React, {Component, PropTypes} from 'react';
import * as d3 from 'd3';

//======================================================================================================================
class ForceLayout extends Component {
  constructor(props) {
    super(props);

    const {width, height, nodes, links} = props;

    // These should not be recreated, only modified
    this.nodes = [...nodes];
    this.links = [...links];

    // Construct the simulation
    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d) => d.id).distance(60))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Arbitrary color scheme
    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    // Drag behavior for nodes
    this.dragstarted = (d) => {
      if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    this.dragged = (d) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    };

    this.dragended = (d) => {
      if (!d3.event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    // Component functions
    this.updateGraph = this.updateGraph.bind(this);
  }

  // Do not redraw the SVG
  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    const {width, height} = this.props;

    this.svg = d3.select(this.refs.mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    this.svg.append('g').attr('class', 'links');
    this.svg.append('g').attr('class', 'nodes');

    // Draw the graphics
    this.updateGraph();
    this.updateGraph();
  }

  componentWillReceiveProps(props) {

    // Remove zombie links
    let deadLinks = [];
    _.forEach(this.links, link => {
      if (!_.find(props.links, l => (link.source.id === l.source && link.target.id === l.target))) {
        deadLinks.push(link);
      }
    });
    _.pullAll(this.links, deadLinks);

    // Remove zombie nodes
    let deadNodes = [];
    _.forEach(this.nodes, node => {
      if (!_.find(props.nodes, {id: node.id})) {
        deadNodes.push(node);
      }
    });
    _.pullAll(this.nodes, deadNodes);

    // Add new nodes
    _.forEach(props.nodes, node => {
      if (!_.find(this.nodes, {id: node.id})) {
        this.nodes.push(node);
      }
    });

    // Add new links
    _.forEach(props.links, link => {
      if (!_.find(this.links, l => (l.source.id === link.source && l.target.id === link.target))) {
        this.links.push(link);
      }
    });

    // Inform the simulation of the updates
    this.simulation
      .nodes(this.nodes)
      .force('link').links(this.links);

    this.updateGraph();
    this.simulation.alpha(0.5);
    this.simulation.restart();
  }

  updateGraph() {
    const nodeGroup = this.svg.selectAll('.nodes');
    const linkGroup = this.svg.selectAll('.links');

    // Get all existing nodes and join them with the new nodes
    let circles = nodeGroup.selectAll('circle')
      .data(this.nodes);

    // Create new nodes
    circles.enter().append('circle')
      .attr('r', 5)
      .style('stroke', '#FFFFFF')
      .style('stroke-with', 1.5)
      .style('fill', (d) => this.color(d.coreObjectType))
      .call(d3.drag()
        .on("start", this.dragstarted)
        .on("drag", this.dragged)
        .on("end", this.dragended));

    // Remove all old nodes
    circles.exit().remove();

    // Get all existing node labels and join them with the new labels
    let labels = nodeGroup.selectAll('.label')
      .data(this.nodes);

    // Create all new node labels
    labels.enter().append('text')
      .attr('class', 'label')
      .attr('dy', '0.35em')
      .text(d => d.name);

    // Remove old node labels
    labels.exit().remove();

    // Get all existing IDs and join them with the new IDs
    let ids = nodeGroup.selectAll('.id')
      .data(this.nodes);

    // Create new IDs
    ids.enter().append('text')
      .attr('class', 'id')
      .attr('dy', '0.35em')
      .attr('font-size', '0.7em')
      .text(d => d.id);

    // Remove all old labels
    ids.exit().remove();

    // Get all existing links and join them with the new links
    let links = linkGroup.selectAll('line')
      .data(this.links);

    // Create new links
    links.enter().append('line')
      .style('stroke', '#000000')
      .style('stroke-opacity', 0.6)
      .style('stroke-width', 1);

    // Remove all old links
    links.exit().remove();

    // Graphics motion definition
    let ticked = () => {
      circles
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      labels
        .attr('x', (d) => d.x + 12)
        .attr('y', (d) => d.y);

      ids
        .attr('x', (d) => d.x + 12)
        .attr('y', (d) => d.y + 12);

      links
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
    };

    // Inform the simulation of updates
    this.simulation
      .nodes(this.nodes)
      .on('tick', ticked);

    this.simulation.force('link')
      .links(this.links);
  }

  render() {
    const {width, height} = this.props;
    const style = {
      width,
      height,
      border: '1px solid #323232'
    };

    return <div style={style} ref='mountPoint'/>;
  }
}

ForceLayout.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  nodes: PropTypes.array.isRequired,
  links: PropTypes.array.isRequired,
  paused: PropTypes.bool
};

//======================================================================================================================

class EMPStorageVisualizer extends Component {
  constructor(props) {
    super(props);

    let nodes = _.map(emp.storage._storage.store, entry => {
      return {
        id: entry.options.coreId,
        name: entry.options.name,
        coreObjectType: entry.options.coreObjectType
      };
    });

    let links = [];
    _.forEach(emp.storage._storage.store, entry => {
      _.forEach(entry.options.childObjects, child => {
        let link = {
          source: entry.options.coreId,
          target: child.options.coreId
        };
        links.push(link);
      });
    });

    this.state = {
      nodes: nodes,
      links: links,
      paused: false
    };

    this.updateNodes = this.updateNodes.bind(this);
    this.toggleVisualizer = this.toggleVisualizer.bind(this);
  }

  updateNodes() {
    let nodes = _.map(emp.storage._storage.store, entry => {
      return {
        id: entry.options.coreId,
        name: entry.options.name,
        coreObjectType: entry.options.coreObjectType
      };
    });

    let links = [];
    _.forEach(emp.storage._storage.store, entry => {
      _.forEach(entry.options.childObjects, child => {
        let link = {
          source: entry.options.coreId,
          target: child.options.coreId
        };
        links.push(link);
      });
    });

    this.setState({
      nodes: nodes,
      links: links
    });
  }

  toggleVisualizer(event) {
    setTimeout(this.setState({paused: !event.target.checked}), 25);
  }

  render() {
    return (
      <div>
        <div className='mdl-grid'>
          <button
            className='mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-cell mdl-cell--2-col'
            onClick={this.updateNodes}>
            <i className='fa fa-refresh'/> Refresh
          </button>
          <div className='mdl-cell mdl-cell--12-col'>
            <ForceLayout width={900} height={650} nodes={this.state.nodes} links={this.state.links}/>
          </div>
        </div>
      </div>);
  }
}

EMPStorageVisualizer.propTypes = {
  paused: PropTypes.bool
};

EMPStorageVisualizer.defaultProps = {
  paused: false
};

export default EMPStorageVisualizer;
