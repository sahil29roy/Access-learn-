import React from 'react';

/**
 * Skip to Main Content Link
 * Essential accessibility feature for keyboard users
 * Appears when focused, allows skipping navigation
 */
interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

const SkipLink: React.FC<SkipLinkProps> = ({
  href = '#main-content',
  children = 'Skip to main content',
}) => {
  return (
    <a
      href={href}
      className="skip-link"
    >
      {children}
    </a>
  );
};

export { SkipLink };
