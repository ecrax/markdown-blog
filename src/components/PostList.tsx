import React from "react";
import Moment from "react-moment";
import { Link } from "react-router-dom";
import Posts from "../posts.json";

interface PostListProps {
  amount?: number | undefined;
  year?: number | undefined;
}
export const PostList: React.FC<PostListProps> = ({ amount, year }) => {
  const postList = Posts.slice(0, amount)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((post) => {
      if (year) {
        return new Date(post.date).getFullYear() === year;
      } else {
        return true;
      }
    })
    .map((post, index) => {
      return (
        <li className="post-item" key={index}>
          <Moment className="dim-text" format="DD-MM-YYYY">
            {post.date}
          </Moment>
          <Link to={`/blog/${post.slug}`}>
            <span>{post.title}</span>
          </Link>
        </li>
      );
    });

  return (
    <ul className="post-list">
      {postList.length > 0 ? (
        postList
      ) : (
        <div>I still need to write something for this year.</div>
      )}
    </ul>
  );
};
