import React from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { PostList } from "../components/PostList";

export const IndexPage: React.FC = () => {
  return (
    <>
      <Header />
      <section id="recent-posts">
        <h2>
          <Link to="/blog">Recent Posts</Link>
        </h2>
        <PostList amount={5} />
      </section>
    </>
  );
};
