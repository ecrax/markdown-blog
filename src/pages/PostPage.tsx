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

  const renderers = {
    code: ({ language, value }: { language: any; value: any }) => {
      return (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          children={value}
        />
      );
    },
  };

  return (
    <div>
      <h1>{postData?.title}</h1>
      <ReactMarkdown
        children={postData?.content as string}
        escapeHtml={false}
        renderers={renderers}
      />
    </div>
  );
};
