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

export default () => {
  const Component = hot(module)(ShowTree);

  ReactDOM.render(
    <Component
      tree={tree}
      maxLen={4}
    />,
    document.getElementById('root')
  );
};
