import React from "react";

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer id="footer">
      <div className="footer-left">Copyright © 2020-2021 ecrax</div>
      <div className="footer-right">Links and stuff</div>
    </footer>
  );
};
