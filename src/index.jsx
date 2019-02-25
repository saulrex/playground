import React from 'react';

import ShowTree from './app';

if (MODULE_DEVELOPMENT) {
  import('./example').then((runExample) => {

    runExample.default();
  })
}

export default ShowTree;
