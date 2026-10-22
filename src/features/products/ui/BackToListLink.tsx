import { Link, useLocation } from 'react-router';
import { listHref } from '../application/listSearch';
import styles from './BackToListLink.module.css';

/** Back to the list, with the search the user came from. */
export function BackToListLink() {
  return (
    <Link to={listHref(useLocation())} className={styles.back}>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Volver al listado
    </Link>
  );
}
