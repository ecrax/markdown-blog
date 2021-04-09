const path = require("path");
const fs = require("fs");
const reader = require("markdown-reader");
const slugify = require("slugify");

let postList = [];

const postsPath = path.join(__dirname, "./posts");
const stream = reader(postsPath);

stream.on("data", (data) => {
  // Identify data as markdown/post
  if (data["type"] === "file") {
    const timestamp = Date.now() * Math.random();
    data.data["content"] = data.markdown;
    data.data["id"] = Math.round(timestamp);
    data.data["slug"] = slugify(data.data.title);
    postList.push(data.data);
  }
});

stream.on("end", () => {
  const postListJson = JSON.stringify(postList);

  for (let i = 0; i < postList.length; i++) {
    // Identify any images in markdown content and add them to array
    let imageUris = [];

    const post = postList[i];
    const linkElements = post["content"].match(/!\[.+?\]\(.+?\)/g);

    if (linkElements) {
      linkElements.forEach((link) => {
        let tmp = link.match(/\(.+?\)/g);
        tmp = tmp[0].replace("(", "");
        tmp = tmp.replace(")", "");
        imageUris.push(tmp);
      });
      //console.log(imageUris);
    }

    // Copy found images to public/images/{slug} folder
    imageUris.forEach((link) => {
      const srcPath = path.join("posts", link);
      const destPath = path.join("public", "images", link);
      const destDir = path.join("public", "images", link.split("\\")[1]);

      if (!fs.existsSync(path.join("public", "images"))) {
        fs.mkdirSync(path.join("public", "images"));
      }

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir);
      }

      fs.copyFileSync(srcPath, destPath);
    });
  }

  // Write json output
  fs.writeFileSync("src/posts.json", postListJson);
});

//TODO: Might need to write tests if I feel like it
