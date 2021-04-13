import React from "react";
import ReactMarkdown from "react-markdown";
import { RouteComponentProps } from "react-router";
import Posts from "../posts.json";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import { Header } from "../components/Header";

type TParams = { slug: string };

export const PostPage: React.FC<RouteComponentProps<TParams>> = ({
  match,
}: RouteComponentProps<TParams>) => {
  const requestedPost = match.params;

  const postData = Posts.find((post) => {
    return post.slug.toLowerCase() === requestedPost.slug.toLowerCase();
  });

  // TODO: Add copy to clipboard (https://www.youtube.com/watch?v=iAAOvv_4ONI&ab_channel=%C3%87elikK%C3%B6seo%C4%9Flu)
  const renderers = {
    code: ({ language, value }: { language: any; value: any }) => {
      return (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          children={value}
          customStyle={{
            borderRadius: "5px",
          }}
        />
      );
    },
  };

  return (
    <>
      <Header />
      <div className="post">
        <h1>
          <span className="noselect dim-text">"</span>
          {postData?.title}
          <span className="noselect dim-text">"</span>
        </h1>

        <div className="category-block">
          <span className="post-code-highlight noselect"> {"{"}</span>
          <br className="noselect" />

          <span className="ind-lvl-1 noselect" style={{ color: "#404449" }}>
            date:
            <span className="post-code-highlight noselect">{" ["}</span>
          </span>
          <br className="noselect" />
          <span className="ind-lvl-2">
            <span className="noselect post-code-highlight">"</span>
            <Moment format="DD-MM-YYYY" children={postData?.date} />
            <span className="noselect post-code-highlight">"</span>
          </span>
          <br className="noselect" />
          <span className="post-code-highlight noselect ind-lvl-1">{"],"}</span>
          <br className="noselect" />

          <span className="ind-lvl-1 noselect" style={{ color: "#404449" }}>
            categories:
            <span className="post-code-highlight noselect">{" ["}</span>
          </span>
          <br className="noselect" />
          <span className="post-categories ">
            {postData?.categories.map((category: any, index: number) => {
              return (
                <span key={index}>
                  <Link
                    to={`/categories/${category}`}
                    className="post-category ind-lvl-2"
                  >
                    {category}
                  </Link>
                  {postData?.categories.length !== index + 1 ? (
                    <span className="post-code-highlight noselect">
                      , <br />
                    </span>
                  ) : null}
                </span>
              );
            })}
          </span>
          <br className="noselect" />
          <span className="post-code-highlight noselect ind-lvl-1">{"]"}</span>
          <br className="noselect" />
          <span className="post-code-highlight noselect">{"}"}</span>
        </div>

        <ReactMarkdown
          children={postData?.content as string}
          escapeHtml={false}
          renderers={renderers}
          transformImageUri={(uri: string) => {
            return uri.startsWith("http")
              ? uri
              : `http://localhost:3000/images/${uri}`;
          }}
        />
      </div>
    </>
  );
};
