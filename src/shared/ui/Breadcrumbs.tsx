import type { ReactNode } from 'react';
import { Link, useMatches, type UIMatch } from 'react-router';
import styles from './Breadcrumbs.module.css';

/** Route handle of the routes that appear in the breadcrumbs. */
export interface BreadcrumbHandle {
  breadcrumb: (match: UIMatch) => ReactNode;
}

function hasBreadcrumb(
  match: UIMatch,
): match is UIMatch<unknown, BreadcrumbHandle> {
  const { handle } = match;
  return (
    typeof handle === 'object' && handle !== null && 'breadcrumb' in handle
  );
}

export function Breadcrumbs() {
  const crumbs = useMatches().filter(hasBreadcrumb);

  return (
    <nav aria-label="Ruta de navegación">
      <ol className={styles.list}>
        {crumbs.map((match, index) => (
          <li key={match.id} className={styles.item}>
            {index > 0 && (
              <span className={styles.separator} aria-hidden="true">
                ›
              </span>
            )}
            {index === crumbs.length - 1 ? (
              <span className={styles.current} aria-current="page">
                {match.handle.breadcrumb(match)}
              </span>
            ) : (
              <Link to={match.pathname} className={styles.link}>
                {match.handle.breadcrumb(match)}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
