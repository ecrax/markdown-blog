const path = require("path");
const fs = require("fs");
const reader = require("markdown-reader");
const slugify = require("slugify");

let postList = [];

const postsPath = path.join(__dirname, "./posts");
const stream = reader(postsPath);

stream.on("data", (data) => {
  const timestamp = Date.now() * Math.random();
  data.data["content"] = data.markdown;
  data.data["id"] = Math.round(timestamp);
  data.data["slug"] = slugify(data.data.title);
  postList.push(data.data);
});

stream.on("end", () => {
  const postListJson = JSON.stringify(postList);
  fs.writeFileSync("src/posts.json", postListJson);
});
