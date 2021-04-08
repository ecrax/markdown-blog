import React from "react";
import ReactMarkdown from "react-markdown";
import { Link, RouteComponentProps } from "react-router-dom";
import Posts from "../posts.json";

type TParams = { slug: string };

export const AllBlogPosts = ({ history }: RouteComponentProps<TParams>) => {
  const postsAsExcerpts = Posts.map((post) => {
    return post.content.split(" ").slice(0, 20).join(" ") + "...";
  });

  return (
    <div>
      {Posts.map((post, index) => {
        return (
          <div key={index}>
            <Link to={`/blog/${post.slug}`}>
              <h1>{post.title}</h1>
            </Link>
            <ReactMarkdown
              children={postsAsExcerpts[index]}
              escapeHtml={true}
              disallowedTypes={["code"]}
            />
          </div>
        );
      })}
    </div>
  );
};
