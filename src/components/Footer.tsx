import React from "react";

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer id="footer">
      <div className="footer-left">Copyright © 2020-{currentYear} ecrax</div>
      <div className="footer-right">Links and stuff</div>
    </footer>
  );
};
