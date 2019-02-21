import React from 'react';
import ReactDOM from 'react-dom';

import ShowTree from './app';

/**
 * @ignore
 */
const runApp = (id) => {
  import('../styles/less/index.less').then(() => {
    ReactDOM.render(
      <ShowTree />,
      document.getElementById(id || 'root')
    );
  });
};

if (MODULE_DEVELOPMENT) {
  runApp();
}

export default ShowTree;
