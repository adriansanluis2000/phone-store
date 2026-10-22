import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { CartBadge } from '../features/cart/ui/CartBadge';
import { Header } from '../shared/ui/Header';
import styles from './RootLayout.module.css';

export function RootLayout() {
  useFocusOnNavigation();

  return (
    <>
      <a href="#main" className={styles.skipLink}>
        Saltar al contenido
      </a>
      <Header actions={<CartBadge />} />
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
    const main = document.getElementById('main');
    if (previous.current === pathname || !main) {
      return;
    }
    previous.current = pathname;
    const heading = main.querySelector('h1');
    if (heading) {
      heading.focus();
      return;
    }

    // The heading of a page that is still loading comes later: the focus
    // waits on the main area and moves to it then, unless the user moved it
    main.focus();
    const observer = new MutationObserver(() => {
      const loaded = main.querySelector('h1');
      if (!loaded) {
        return;
      }
      observer.disconnect();
      if (document.activeElement === main) {
        loaded.focus();
      }
    });
    observer.observe(main, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
    };
  }, [pathname]);
}
