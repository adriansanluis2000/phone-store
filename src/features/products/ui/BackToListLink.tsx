import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { listHref, listSearchFrom } from '../application/listSearch';
import styles from './BackToListLink.module.css';

/**
 * Back to the list, with the search the user came from. Coming from the list,
 * it goes back in history as the browser button does, so the list shows up
 * where the user left it; a product opened from elsewhere links to the list.
 */
export function BackToListLink() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromList = listSearchFrom(location) !== undefined;

  // A plain click only: with a modifier key the link opens a new tab or window
  const backInHistory = (event: MouseEvent) => {
    const modified =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (fromList && event.button === 0 && !modified) {
      event.preventDefault();
      void navigate(-1);
    }
  };

  return (
    <Link
      to={listHref(location)}
      onClick={backInHistory}
      className={styles.back}
    >
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
