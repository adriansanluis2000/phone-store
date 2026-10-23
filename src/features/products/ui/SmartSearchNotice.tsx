import styles from './SmartSearchNotice.module.css';

/** Says that the smart search failed and the text search took over. */
export function SmartSearchNotice() {
  return (
    <p className={styles.notice} role="status">
      La búsqueda inteligente no está disponible ahora mismo. Te mostramos los
      resultados de la búsqueda por texto.
    </p>
  );
}
