import React from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { PostList } from "../components/PostList";

export const AllPostsPage: React.FC = () => {
  const first = 2020;
  const second = new Date().getFullYear();
  let arr = [];

  for (let i = first; i <= second; i++) arr.push(i);
  arr = arr.reverse();

  return (
    <>
      <Header />
      {arr.map((value: number, index: number) => {
        return (
          <section key={index}>
            <h2 id={value.toString()}>
              <Link to={`/blog#${value.toString()}`}>{value.toString()}</Link>
            </h2>
            <PostList year={value} />
          </section>
        );
      })}
    </>
  );
};
