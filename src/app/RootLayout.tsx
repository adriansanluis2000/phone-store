import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import styles from './RootLayout.module.css';

export function RootLayout() {
  useFocusOnNavigation();

  return (
    <>
      <a href="#main" className={styles.skipLink}>
        Saltar al contenido
      </a>
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  );
}

// After a client navigation, moves the focus to the new page as a full page
// load would, so that screen readers announce where the user landed
function useFocusOnNavigation() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) {
      return;
    }
    previous.current = pathname;
    const target =
      document.querySelector<HTMLElement>('main h1') ??
      document.getElementById('main');
    target?.focus();
  }, [pathname]);
}
