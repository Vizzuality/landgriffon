import classNames from 'classnames';
import RCTreeSelect, { TreeSelectProps } from 'rc-tree-select';
import styles from './styles.module.scss';

const TreeSelect: React.FC<TreeSelectProps> = (props: TreeSelectProps) => (
  <RCTreeSelect className={classNames(styles.treeSelect, props.className)} {...props} />
);

export default TreeSelect;
