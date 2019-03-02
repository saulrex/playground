import "@babel/polyfill";
import React from 'react';
import ReactDOM from "react-dom";

import { hot } from 'react-hot-loader';

import ShowTree from '../app';

import '../../styles/less/index.less';

const tree = {
  "id": "1",
  "name": "flare",
  "children": [{
    "id": "2",
    "name": "analytics",
    "children": [{
      "id": "3",
      "name": "cluster",
      "children": [{
        "id": "4",
        "name": "AgglomerativeCluster"
      }, {
        "id": "5",
        "name": "CommunityStructure"
      }, {
        "id": "6",
        "name": "HierarchicalCluster"
      }, {
        "id": "7",
        "name": "MergeEdge"
      }]
    }, {
      "id": "8",
      "name": "graph",
      "children": [{
        "id": "9",
        "name": "BetweennessCentrality"
      }, {
        "id": "10",
        "name": "LinkDistance"
      }, {
        "id": "11",
        "name": "MaxFlowMinCut"
      }, {
        "id": "12",
        "name": "ShortestPaths"
      }, {
        "id": "13",
        "name": "SpanningTree"
      }]
    }]
  }]
};

const filterTree = (node, len, step = 1) => {
  return {
    ...node,
    children: node.children &&
    node.children.length &&
    len > step ? node.children.map((node) => filterTree(node, len, step + 1)) : undefined
  }
};

const findInTree = (node, id, cb) => {
  if (node.id === id) {
    node = cb(node);
  }

  return {
    ...node,
    children: node.children &&
    node.children.length ? node.children.map((node) => findInTree(node, id, cb)) : undefined
  }
};

const Example = (ShowTree) => {
  const EXAMPLE_LENGTH = 4;

  class HOC extends React.Component {
    state = {
      tree: filterTree(tree, EXAMPLE_LENGTH),
      len: EXAMPLE_LENGTH,
      maxLen: 4,
    }

    fetchLen = (len) => {
      setTimeout(() => {
        this.setState({ len, tree: filterTree(tree, len) })
      }, 100);
    }

    fetchOpenNode = (id, isOpened) => {
      const currentTree = this.state.tree;

      setTimeout(() => {
        this.setState({ tree: findInTree(currentTree, id, (node) => {
          let nodes;

          if (isOpened) {
            findInTree(tree, id, (searchedNode) => {
              if (searchedNode.children && searchedNode.children.length) {
                nodes = searchedNode.children.map((node) => {
                  return { ...node, children: undefined }
                });
              }

              return searchedNode;
            });
          }

          return { ...node, children: isOpened && nodes ? nodes : undefined }
        })});
      }, 100);
    }

    render() {
      return <ShowTree
        tree={this.state.tree}
        len={this.state.len}
        maxLen={this.state.maxLen}
        onChangeLen={(len) => this.fetchLen(len)}
        onClickNode={({ id }, isOpened) => {
          this.fetchOpenNode(id, isOpened);
        }}
      />;
    }
  }

  return HOC;
};

const runExample = () => {
  const WrappedShowTree = Example(ShowTree);
  const Component = hot(module)(WrappedShowTree);

  ReactDOM.render(
    <Component />,
    document.getElementById('root')
  );
};

runExample();