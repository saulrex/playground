import React from 'react';
import cytoscape from 'cytoscape';
import cxtmenu from 'cytoscape-cxtmenu';
import spread from 'cytoscape-spread';

cytoscape.use( cxtmenu );
spread(cytoscape);

import { hot } from 'react-hot-loader';

import style from './style.less'

const mock = {
  // nodes: [
  //   { data: { id: 'a', name: 'a title' } },
  //   { data: { id: 'b', name: 'b title' } },
  //   { data: { id: 'b1', name: 'b1 title' } },
  //   { data: { id: 'b2', name: 'b2 title' } },
  //   { data: { id: 'c', name: 'c title' } },
  //   { data: { id: 'd', name: 'd title' } },
  //   { data: { id: 'e', name: 'e title' } },
  //   { data: { id: 'f', name: 'f title' } },
  //   { data: { id: 'f1', name: 'f1 title' } },
  //   { data: { id: 'f2', name: 'f2 title' } },
  //   { data: { id: 'f3', name: 'f3 title' } },
  //   { data: { id: 'f4', name: 'f4 title' } }
  // ],
  // edges: [
  //   { data: { source: 'a', target: 'b' } },
  //   { data: { source: 'a', target: 'b1' } },
  //   { data: { source: 'a', target: 'b2' } },
  //   { data: { source: 'a', target: 'c' } },
  //   { data: { source: 'c', target: 'd' } },
  //   { data: { source: 'd', target: 'e' } },
  //   { data: { source: 'e', target: 'f' } },
  //   { data: { source: 'e', target: 'f1' } },
  //   { data: { source: 'e', target: 'f2' } },
  //   { data: { source: 'e', target: 'f3' } },
  //   { data: { source: 'e', target: 'f4' } }
  // ]
  items: [{
    id: "1",
    name: "a",
    children: [{
      id: "2",
      name: "b1"
    }, {
      id: "3",
      name: "b2"
    }, {
      id: "6",
      name: "c",
      children:  [{
        id: "7",
        name: "d1",
      }, {
        id: "8",
        name: "d2",
        children:  [{
          id: "9",
          name: "e",
        }]
      }]
    }, {
      id: "5",
      name: "b4"
    }]
  }]
};

const backend = (len) => {
  let nodes = [], edges = [];

  const getItems = (items, curLen, parent) => {

    items.forEach((item) => {
      nodes.push({ data: { id: item.id, name: item.name } });

      if (parent) {
        edges.push({ data: { source: parent, target: item.id } });
      }

      if (item.children && item.children.length && curLen < len) {
        getItems(item.children, curLen + 1, item.id);
      }
    });
  };

  getItems(mock.items, 1);

  return {
    len: 4,
    curLen: len,
    nodes,
    edges
  }
};
/**
 * this is ShowTree
 * @param {Array<{ id: number }>} [tree=Array] - tree items here
 * @example
 * import ShowTree from './showTree';
 *
 *  ReactDOM.render(
 *   <ShowTree />,
 *   element
 *  );
 * };
 *
 * runApp();
 */
const ShowTree = class extends React.PureComponent {
  state = {
    len: 2
  }

  cyRef = React.createRef();

  init = (curLen) => {
    const cyRef = this.cyRef;

    const { nodes, edges, len } =  backend(curLen);

    const cy = window.cy = cytoscape({
      container: cyRef.current,
      layout: {
        name: 'circle',
        minDist: 40
      },
      ready: function(){
        cyRef.current
      },
      style: [
        {
          selector: 'node',
          css: {
            'content': 'data(name)'
          }
        },
        {
          selector: 'edge',
          css: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle'
          }
        }
      ],
      elements: { nodes, edges }
    });
    cy.cxtmenu({
      selector: 'node, edge',
      commands: [
        {
          content: '<span class="fa fa-flash fa-2x"></span>',
          select: function(ele){
            console.log( ele.id() );
          }
        },
        {
          content: '<span class="fa fa-star fa-2x"></span>',
          select: function(ele){
            console.log( ele.data('name') );
          },
          enabled: false
        },
        {
          content: 'Text',
          select: function(ele){
            console.log( ele.position() );
          }
        }
      ]
    });
    cy.cxtmenu({
      selector: 'core',
      commands: [
        {
          content: 'bg1',
          select: function(){
            console.log( 'bg1' );
          }
        },
        {
          content: 'bg2',
          select: function(){
            console.log( 'bg2' );
          }
        }
      ]
    });

    this.setState({
      maxLen: len,
      len: curLen
    })
  }

  componentDidMount() {
    this.init(this.state.len)
  }

  changeLen = (len) => {
    if (this.state.len !== len) {
      this.init(len)
    }
  }

  render() {
    return (
      <>
        <div className={style.wrap}>
          <div id="cy" className={style.cy} ref={this.cyRef}></div>
          <div className={style.mtop}>
            {/*<button className={style.btnCube}>+</button>*/}
            {/*<button className={style.btnCube}>-</button>*/}
            {this.state.maxLen && <input
              type="range"
              name="points"
              min="2"
              max={this.state.maxLen}
              onChange={({ target: { value } }) => {
                this.changeLen(+value)
              }}
              value={this.state.len}
            />}
          </div>
        </div>
      </>
    );
  }
};

export default hot(module)(ShowTree);
