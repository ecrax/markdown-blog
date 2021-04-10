import React from "react";
import ReactMarkdown from "react-markdown";
import { RouteComponentProps } from "react-router";
import Posts from "../posts.json";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type TParams = { slug: string };

export const PostPage = ({ match }: RouteComponentProps<TParams>) => {
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
    <div className="post">
      <h1>{postData?.title}</h1>
      <p>
        {postData?.categories.map((category: any, index: number) => {
          return (
            <>
              <span>
                {category}
                {postData?.categories.length !== index + 1 ? (
                  <span>, </span>
                ) : null}
              </span>
            </>
          );
        })}
      </p>
      <p>{postData?.date}</p>

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
  );
};
