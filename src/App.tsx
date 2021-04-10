import React from "react";
import { Route, Switch } from "react-router";
import { AllBlogPosts } from "./components/AllBlogPosts";
import { Footer } from "./components/Footer";
import { PostPage } from "./pages/PostPage";
import "./index.css";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <>
      <div className="content">
        <Switch>
          <Route exact path="/" component={AllBlogPosts} />
          <Route path="/blog/:slug" component={PostPage} />
        </Switch>
      </div>
      <Footer></Footer>
    </>
  );
};

export default App;
