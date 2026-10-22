import styles from './Skeleton.module.css';

interface SkeletonProps {
  /** Size, shape and spacing of the block, given by the caller. */
  className?: string;
}

/** A shimmering block that stands for content still loading. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      className={
        className ? [styles.skeleton, className].join(' ') : styles.skeleton
      }
    />
  );
}
