import { Skeleton } from 'antd';
import styles from './styles.module.scss';

const NetworkListSkeletonCountList = [1, 1, 1, 1, 1];
export function NetworkListSkeletonForWeb() {
  return (
    <div className={styles.networkListSkeletonForWeb}>
      {NetworkListSkeletonCountList.map((_item, index) => {
        return (
          <div className={styles.skeleton} key={'NetworkListSkeletonForWeb' + index}>
            <div className={styles.left}>
              <div className={styles.row1}>
                <Skeleton.Input />
              </div>
              <div className={styles.row2}>
                <Skeleton.Input />
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.row1}>
                <Skeleton.Input active />
              </div>
              <div className={styles.row2}>
                <Skeleton.Input active />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function NetworkListSkeletonForMobile() {
  return (
    <div className={styles.networkListSkeletonForMobile}>
      {NetworkListSkeletonCountList.map((_item, index) => {
        return (
          <div className={styles.skeleton} key={'NetworkListSkeletonForMobile' + index}>
            <div className={styles.row1}>
              <Skeleton.Input />
            </div>
            <div className={styles.row2}>
              <Skeleton.Input />
            </div>
            <div className={styles.row3}>
              <Skeleton.Input active />
            </div>
          </div>
        );
      })}
    </div>
  );
}
