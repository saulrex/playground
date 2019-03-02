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

  static defaultProps = {
    len: 1,
  }

  cyRef = React.createRef();

  componentDidMount() {
    this.init()
  }

  componentDidUpdate({ tree }) {
    if (!isEqual(this.props.tree, tree)) {
      if (!this.tree) {
        return this.init();
      } else {
        this.tree.updateTree(this.props.tree);
      }
    }

    this.updateTreeState();
  }

  init = () => {
    this.tree = new tree({
      rootNode: this.cyRef.current,
      treeData: this.props.tree ? this.props.tree : {},
    });

    this.updateTreeState();
  }

  updateTreeState = () => {
    this.tree.state.onClickNode = this.props.onClickNode;
  }

  changeLen = (len) => {
    if (this.props.len !== len) {
      if (typeof this.props.onChangeLen === 'function') {
        this.props.onChangeLen(len);
      }
    }
  }

  render() {
    return (
      <div className={style.wrap} ref={this.cyRef}>
        {<div className={style.mtop}>
          {/*<button className={style.btnCube}>+</button>*/}
          {/*<button className={style.btnCube}>-</button>*/}
          {!this.props.tree}
          {this.props.maxLen && <input
            type="range"
            name="points"
            min="1"
            max={this.props.maxLen}
            onChange={({ target: { value } }) => {
              this.changeLen(+value)
            }}
            value={this.props.len}
          />}
        </div>}
      </div>
    );
  }
};

export default ShowTree;
