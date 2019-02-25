import * as d3 from 'd3';

import style from './style.less'

export default class {
  state = {
    root: undefined,
    tree: undefined,
    links: undefined,
    viewerWidth: undefined,
    viewerHeight: undefined,
    svgGroup: undefined,
    // variables for drag/drop
    selectedNode: null,
    draggingNode: null,
    dragStarted: false,
    panTimer: 0,
    // Calculate total nodes, max label length
    totalNodes: 0,
    maxLabelLength: 0,
    //events
    dragListener: () => {},
    click: () => {},
    //other
    duration: 750,
  }

  // define a d3 diagonal projection for use by the node paths later on.
  diagonal = d3.svg.diagonal()
    .projection(function (d) {
      return [d.y, d.x];
    });

  cleanup = (rootNode) => {
    if (rootNode && rootNode.children && rootNode.children[1]) {
      rootNode.children[1].remove();
    }
  }

  // Define the zoom function for the zoomable tree
  zoom = () => {
    this.state.svgGroup.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
  }

  // define the zoomListener which calls the zoom function on the 'zoom' event constrained within the scaleExtents
  zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on('zoom', this.zoom);

  update = (source) => {
    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    const levelWidth = [1];
    const childCount = (level, n) => {

      if (n.children && n.children.length > 0) {
        if (levelWidth.length <= level + 1) levelWidth.push(0);

        levelWidth[level + 1] += n.children.length;
        n.children.forEach(function (d) {
          childCount(level + 1, d);
        });
      }
    };
    childCount(0, this.state.root);
    var newHeight = d3.max(levelWidth) * 50; // 25 pixels per line
    this.state.tree = this.state.tree.size([newHeight, this.state.viewerWidth]);

    // Compute the new tree layout.
    this.state.nodes = this.state.tree.nodes(this.state.root).reverse();
    this.state.links = this.state.tree.links(this.state.nodes);

    // Set widths between levels based on maxLabelLength.
    this.state.nodes.forEach((d) => {
      d.y = (d.depth * (this.state.maxLabelLength * 10)); //maxLabelLength * 10px
      // alternatively to keep a fixed scale one can set a fixed depth per level
      // Normalize for fixed-depth by commenting out below line
      // d.y = (d.depth * 500); //500px per level.
    });

    // Update the nodes…
    let i = 0;
    const node = this.state.svgGroup.selectAll(`g.${style.node}`)
      .data(this.state.nodes, function (d) {
        return d.id || (d.id = ++i);
      });

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node.enter().append('g')
      .call(this.state.dragListener)
      .attr('class', style.node)
      .attr('transform', function (d) {
        return 'translate(' + source.y0 + ',' + source.x0 + ')';
      })
      .on('click', this.state.click);

    nodeEnter.append('circle')
      .attr('class', style.nodeCircle)
      .attr('r', 5)
      .style('fill', function (d) {
        return d._children ? 'lightsteelblue' : '#fff';
      });

    const TEXT_MARGIN_SIZE = 15;

    nodeEnter.append('text')
      .attr('x', function (d) {
        return d.children || d._children ? -TEXT_MARGIN_SIZE : TEXT_MARGIN_SIZE;
      })
      .attr('dy', '.35em')
      .attr('class', style.nodeText)
      .attr('text-anchor', function (d) {
        return d.children || d._children ? 'end' : 'start';
      })
      .text(function (d) {
        return d.name;
      })
      .style('fill-opacity', 0);

    // phantom node to give us mouseover in a radius around it
    nodeEnter.append('circle')
      .attr('class', style.ghostCircle)
      .attr('r', 30)
      .attr('opacity', 0.2) // change this to zero to hide the target area
      .style('fill', 'red')
      .attr('pointer-events', 'mouseover')
      .on('mouseover', (node) => {
        this.overCircle(node);
      })
      .on('mouseout', (node) => {
        this.outCircle(node);
      });

    // Update the text to reflect whether node has children or not.
    node.select('text')
      .attr('x', function (d) {
        return d.children || d._children ? -TEXT_MARGIN_SIZE : TEXT_MARGIN_SIZE;
      })
      .attr('text-anchor', function (d) {
        return d.children || d._children ? 'end' : 'start';
      })
      .text(function (d) {
        return d.name;
      });

    // Change the circle fill depending on whether it has children and is collapsed
    node.select(`circle.${style.nodeCircle}`)
      .attr('r', 4.5)
      .style('fill', function (d) {
        return d._children ? 'lightsteelblue' : '#fff';
      });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(this.state.duration)
      .attr('transform', function (d) {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    // Fade the text in
    nodeUpdate.select('text')
      .style('fill-opacity', 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
      .duration(this.state.duration)
      .attr('transform', function (d) {
        return 'translate(' + source.y + ',' + source.x + ')';
      })
      .remove();

    nodeExit.select('circle')
      .attr('r', 0);

    nodeExit.select('text')
      .style('fill-opacity', 0);

    // Update the links…
    var link = this.state.svgGroup.selectAll(`path.${style.link}`)
      .data(this.state.links, function (d) {
        return d.target.id;
      });

    // Enter any new links at the parent's previous position.
    link.enter().insert('path', 'g')
      .attr('class', style.link)
      .attr('d', (d) => {
        const o = {
          x: source.x0,
          y: source.y0
        };

        return this.diagonal({
          source: o,
          target: o
        });
      });

    // Transition links to their new position.
    link.transition()
      .duration(this.state.duration)
      .attr('d', this.diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(this.state.duration)
      .attr('d', (d) => {
        var o = {
          x: source.x,
          y: source.y
        };
        return this.diagonal({
          source: o,
          target: o
        });
      })
      .remove();

    // Stash the old positions for transition.
    this.state.nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Helper functions for collapsing and expanding nodes.

  collapse = (d) => {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  expand = (d) => {
    if (d._children) {
      d.children = d._children;
      d.children.forEach(expand);
      d._children = null;
    }
  }

  overCircle = (d) => {
    this.state.selectedNode = d;
    this.updateTempConnector();
  };
  outCircle = (d) => {
    this.state.selectedNode = null;
    this.updateTempConnector();
  };

  // Function to update the temporary connector indicating dragging affiliation
  updateTempConnector = () => {
    var data = [];
    if (this.state.draggingNode !== null && this.state.selectedNode !== null) {
      // have to flip the source coordinates since we did this for the existing connectors on the original tree
      data = [{
        source: {
          x: this.state.selectedNode.y0,
          y: this.state.selectedNode.x0
        },
        target: {
          x: this.state.draggingNode.y0,
          y: this.state.draggingNode.x0
        }
      }];
    }
    var link = this.state.svgGroup.selectAll(`.${style.templink}`).data(data);

    link.enter().append('path')
      .attr('class', style.templink)
      .attr('d', d3.svg.diagonal())
      .attr('pointer-events', 'none');

    link.attr('d', d3.svg.diagonal());

    link.exit().remove();
  };

  // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

  toStartPosition = (source) => {
    const scale = this.zoomListener.scale();
    let x = -source.y0;
    let y = -source.x0;
    x = x * scale + this.state.viewerWidth / 10;
    y = y * scale + this.state.viewerHeight / 2;
    d3.select('g').transition()
      .duration(this.state.duration)
      .attr('transform', 'translate(' + x + ',' + y + ')scale(' + scale + ')');
    this.zoomListener.scale(scale);
    this.zoomListener.translate([x, y]);
  }

  endDrag = (domNode) => {
    this.state.selectedNode = null;
    d3.selectAll(`.${style.ghostCircle}`).attr('class', style.ghostCircle);
    d3.select(domNode).attr('class', style.node);
    // now restore the mouseover event or we won't be able to drag a 2nd time
    d3.select(domNode).select(`.${style.ghostCircle}`).attr('pointer-events', '');
    this.updateTempConnector();
    if (this.state.draggingNode !== null) {
      this.update(this.state.root);
      this.toStartPosition(this.state.draggingNode);
      this.state.draggingNode = null;
    }
  }

  updateTree = (treeData) => {
    // Define the root
    this.state.root = treeData;
    // this.state.root.x0 = this.state.viewerHeight / 2;
    // this.state.root.y0 = 0;

    // Layout the tree initially and center on the root node.
    this.update(this.state.root);
    // this.toStartPosition(this.state.root);
  }

  constructor({ rootNode, treeData = [], onDragEnd = () => {} }) {

    this.cleanup(rootNode);

    // panning variables
    const panSpeed = 200;
    const panBoundary = 20; // Within 20px from edges will pan when dragging.

    this.state.viewerWidth = rootNode.offsetWidth;
    this.state.viewerHeight = rootNode.offsetHeight;

    this.state.tree = d3.layout.tree().size([this.state.viewerHeight, this.state.viewerWidth]);

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
      if (!parent) return;

      visitFn(parent);

      var children = childrenFn(parent);
      if (children) {
        var count = children.length;
        for (var i = 0; i < count; i++) {
          visit(children[i], visitFn, childrenFn);
        }
      }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, (d) => {
      this.state.totalNodes++;
      this.state.maxLabelLength = Math.max(d.name.length, this.state.maxLabelLength);

    }, function (d) {
      return d.children && d.children.length > 0 ? d.children : null;
    });


    // // sort the tree according to the node names
    //
    // function sortTree() {
    //   tree.sort(function(a, b) {
    //     return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
    //   });
    // }
    // // Sort the tree initially incase the JSON isn't in a sorted order.
    // sortTree();

    // TODO: Pan function, can be better implemented.
    let translateX, translateY;

    const pan = (domNode, direction) => {
      var speed = panSpeed;
      if (this.state.panTimer) {
        clearTimeout(this.state.panTimer);
        const translateCoords = d3.transform(this.state.svgGroup.attr('transform'));
        if (direction == 'left' || direction == 'right') {
          translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
          translateY = translateCoords.translate[1];
        } else if (direction == 'up' || direction == 'down') {
          translateX = translateCoords.translate[0];
          translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
        }
        const scaleX = translateCoords.scale[0];
        const scaleY = translateCoords.scale[1];
        const scale = this.zoomListener.scale();
        this.state.svgGroup.transition().attr('transform', 'translate(' + translateX + ',' + translateY + ')scale(' + scale + ')');
        d3.select(domNode).select(`g.${style.node}`).attr('transform', 'translate(' + translateX + ',' + translateY + ')');
        this.zoomListener.scale(this.zoomListener.scale());
        this.zoomListener.translate([translateX, translateY]);
        this.zoomListener.translate([translateX, translateY]);
        this.state.panTimer = setTimeout(function () {
          pan(domNode, speed, direction);
        }, 50);
      }
    }

    const initiateDrag = (d, domNode) => {
      this.state.draggingNode = d;
      d3.select(domNode).select(`.${style.ghostCircle}`).attr('pointer-events', 'none');
      d3.selectAll(`.${style.ghostCircle}`).attr('class', `${style.ghostCircle} ${style.show}`);
      d3.select(domNode).attr('class', `${style.node} ${style.activeDrag}`);

      this.state.svgGroup.selectAll(`g.${style.node}`).sort((a, b) => { // select the parent and sort the path's
        if (a.id != this.state.draggingNode.id) return 1; // a is not the hovered element, send 'a' to the back
        else return -1; // a is the hovered element, bring 'a' to the front
      });
      // if nodes has children, remove the links and nodes
      if (this.state.nodes.length > 1) {
        // remove link paths
        const links = this.state.tree.links(this.state.nodes);
        const nodePaths = this.state.svgGroup.selectAll(`path.${style.link}`)
          .data(links, function (d) {
            return d.target.id;
          }).remove();
        // remove child nodes
        const nodesExit = this.state.svgGroup.selectAll(`g.${style.node}`)
          .data(this.state.nodes, function (d) {
            return d.id;
          }).filter((d, i) => {
            if (d.id == this.state.draggingNode.id) {
              return false;
            }
            return true;
          }).remove();
      }

      // remove parent link
      const parentLink = this.state.tree.links(this.state.tree.nodes(this.state.draggingNode.parent));
      this.state.svgGroup.selectAll(`path.${style.link}`).filter((d, i) => {
        if (d.target.id == this.state.draggingNode.id) {
          return true;
        }
        return false;
      }).remove();

      this.state.dragStarted = null;
    }

    // define the baseSvg, attaching a class for styling and the zoomListener
    const baseSvg = d3.select(rootNode).append('svg')
      .attr('width', this.state.viewerWidth)
      .attr('height', this.state.viewerHeight)
      .attr('class', style.overlay)
      .call(this.zoomListener);

    let self = this;
    // Define the drag listeners for drag/drop behaviour of nodes.
    this.state.dragListener = d3.behavior.drag()
      .on('dragstart', (d) => {
        if (d == self.state.root) {
          return;
        }
        self.state.dragStarted = true;
        self.state.nodes = self.state.tree.nodes(d);
        d3.event.sourceEvent.stopPropagation();
        // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
      })
      .on('drag', function (d) {
        if (d == root) {
          return;
        }
        if (self.state.dragStarted) {
          initiateDrag(d, this);
        }

        // get coords of mouseEvent relative to svg container to allow for panning
        const relCoords = d3.mouse(baseSvg[0][0]);
        if (relCoords[0] < panBoundary) {
          self.state.panTimer = true;
          pan(this, 'left');
        } else if (relCoords[0] > (baseSvg[0][0].innerWidth - panBoundary)) {
          self.state.panTimer = true;
          pan(this, 'right');
        } else if (relCoords[1] < panBoundary) {
          self.state.panTimer = true;
          pan(this, 'up');
        } else if (relCoords[1] > (baseSvg[0][0].innerHeight - panBoundary)) {
          self.state.panTimer = true;
          pan(this, 'down');
        } else {
          try {
            clearTimeout(self.state.panTimer);
          } catch (e) {

          }
        }

        d.x0 += d3.event.dy;
        d.y0 += d3.event.dx;
        var node = d3.select(this);
        node.attr('transform', 'translate(' + d.y0 + ',' + d.x0 + ')');
        self.updateTempConnector();
      }).on('dragend', function (d) {
        if (d == self.state.root) {
          return;
        }
        let domNode = this;
        if (self.state.selectedNode) {
          onDragEnd(self.state.selectedNode);
          // now remove the element from the parent, and insert it into the new elements children
          var index = self.state.draggingNode.parent.children.indexOf(self.state.draggingNode);
          if (index > -1) {
            self.state.draggingNode.parent.children.splice(index, 1);
          }
          if (typeof self.state.selectedNode.children !== 'undefined' || typeof self.state.selectedNode._children !== 'undefined') {
            if (typeof self.state.selectedNode.children !== 'undefined') {
              self.state.selectedNode.children.push(self.state.draggingNode);
            } else {
              self.state.selectedNode._children.push(self.state.draggingNode);
            }
          } else {
            self.state.selectedNode.children = [];
            self.state.selectedNode.children.push(self.state.draggingNode);
          }
          // Make sure that the node being added to is expanded so user can see added node is correctly moved
          self.expand(self.state.selectedNode);

          // sortTree();
          self.endDrag(domNode);
        }

        self.endDrag(domNode);
      });

    // Toggle children function

    function toggleChildren(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      return d;
    }

    // Toggle children on click.

    this.state.click = (d) => {
      if (d3.event.defaultPrevented) return; // click suppressed
      d = toggleChildren(d);
      this.update(d);
      this.toStartPosition(d);
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    this.state.svgGroup = baseSvg.append('g');

    // Define the root
    this.state.root = treeData;
    this.state.root.x0 = this.state.viewerHeight / 2;
    this.state.root.y0 = 0;

    // Layout the tree initially and center on the root node.
    this.update(this.state.root);
    this.toStartPosition(this.state.root);
  }
}


