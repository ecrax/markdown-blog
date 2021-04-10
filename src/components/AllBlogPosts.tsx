import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import Posts from "../posts.json";

type TParams = { slug: string };

export const AllBlogPosts = ({ history }: RouteComponentProps<TParams>) => {
  return (
    <section id="recent-posts">
      <h1>Recent Posts</h1>
      <ul className="post-list">
        {Posts.slice(0, 5).map((post, index) => {
          return (
            <li className="post-item" key={index}>
              <time>{post.date}</time>
              <Link to={`/blog/${post.slug}`}>
                <p>{post.title}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
