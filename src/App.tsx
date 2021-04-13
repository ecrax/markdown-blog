import React from "react";
import { Route, Switch } from "react-router";
import { IndexPage } from "./pages/IndexPage";
import { Footer } from "./components/Footer";
import { PostPage } from "./pages/PostPage";
import "./index.css";
import { AllPostsPage } from "./pages/AllPostsPage";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <>
      <div className="content">
        <Switch>
          <Route exact path="/" component={IndexPage} />
          <Route exact path="/blog/" component={AllPostsPage} />
          <Route path="/blog/:slug" component={PostPage} />
          <Route path="/categories/:category" component={PostPage} />
        </Switch>
      </div>
      <Footer></Footer>
    </>
  );
};

export default App;
