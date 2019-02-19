import React from 'react';
import ReactDOM from 'react-dom';

import {hot} from "react-hot-loader";

import ShowTree from './app';

/**
 * @ignore
 */
const runApp = (id) => {
  ReactDOM.render(
    <ShowTree />,
    document.getElementById(id || 'root')
  );
};

if (MODULE_DEVELOPMENT) {
  runApp();
}

export default hot(module)(ShowTree);
