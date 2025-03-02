import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} KIU Bookshop. All rights reserved.</p>
        <p><a href="mailto:info@universitybookshop.com">harithdevinda8@gmail.com</a></p>
        <p>+94703359228</p>
      </div>
    </footer>
  );
};

export default Footer;