import React from "react";
import { Route, Switch } from "react-router";
import { AllBlogPosts } from "./components/AllBlogPosts";
import { PostPage } from "./pages/PostPage";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <div>
      <Switch>
        <Route exact path="/" component={AllBlogPosts} />
        <Route path="/blog/:slug" component={PostPage} />
      </Switch>
    </div>
  );
};

export default App;
