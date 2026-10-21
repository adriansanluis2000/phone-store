import type { ComponentProps } from 'react';
import { Link } from 'react-router';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary';

function classNameFor(variant: Variant): string {
  return [styles.button, styles[variant]].join(' ');
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
}

export function Button({
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return <button type={type} className={classNameFor(variant)} {...props} />;
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
}

/** A link that looks like a button, for actions that navigate. */
export function ButtonLink({ variant = 'primary', ...props }: ButtonLinkProps) {
  return <Link className={classNameFor(variant)} {...props} />;
}
