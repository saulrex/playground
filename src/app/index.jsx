import React from 'react';
import { isEqual } from 'lodash';

import tree from '../tree';

import style from './style.less';

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

  componentDidMount() {
    this.init(this.state.len)
  }

  componentDidUpdate(props, { tree, maxLen }) {
    if (!isEqual(props.tree, { tree, maxLen })) {
      this.tree.updateTree(props.tree);
    }
  }

  init = (curLen) => {
    this.tree = new tree({
      rootNode: this.cyRef.current,
      treeData: this.props.tree ? this.props.tree : {}
    });

    this.setState({
      len: curLen
    });
  }

  changeLen = (len) => {
    if (this.state.len !== len) {
      this.init(len)
    }
  }

  render() {
    return (
      <div className={style.wrap} ref={this.cyRef}>
        {<div className={style.mtop}>
          {/*<button className={style.btnCube}>+</button>*/}
          {/*<button className={style.btnCube}>-</button>*/}
          {this.props.maxLen && <input
            type="range"
            name="points"
            min="2"
            max={this.props.maxLen}
            onChange={({ target: { value } }) => {
              this.changeLen(+value)
            }}
            value={this.state.len}
          />}
        </div>}
      </div>
    );
  }
};

export default ShowTree;
