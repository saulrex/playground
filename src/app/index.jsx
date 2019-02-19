import React from 'react';

import { hot } from 'react-hot-loader'

import style from './style.less'

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
const ShowTree = ({ tree }) => {
  return (
    <div className={style.main}>Hello World!</div>
  );
};

export default ShowTree;