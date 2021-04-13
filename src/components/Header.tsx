import React from "react";
import { Link } from "react-router-dom";

export const Header: React.FC = () => {
  return (
    <header>
      <Link to="/">
        <h1>Leo Kling</h1>
      </Link>
      <nav>
        <ul>
          <li className="nav-border">
            <Link to="/">Home</Link>
          </li>
          <li className="nav-border">
            <Link to="/blog">Blog</Link>
          </li>
          <li className="nav-border">
            <Link to="/about">About</Link>
          </li>
          <li className="nav-border">
            <Link to="/projects">Projects</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};
