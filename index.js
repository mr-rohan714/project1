const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/users.js");
const Post = require("./models/posts.js");
const Comment = require("./models/comment.js");
const methodOverride = require("method-override");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

let port = 8080;

//crud operation on users details
app.get("/user", (req, res) => {
  res.render("index.ejs");
});

app.get("/user/registration", (req, res) => {
  res.render("registration.ejs");
});

app.post("/user/registration", async (req, res) => {
  let { user, email, password } = req.body;
  let userDetail = new User({
    user: user,
    email: email,
    password: password,
  });
  let detail = await User.findOne({ email: email });
  if (detail) {
    res.send("Dublicate Entry!");
  } else {
    userDetail
      .save()
      .then((rest) => {
        res.redirect("/user");
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  }
});

app.get("/user/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/user/login", async (req, res) => {
  let { user, password } = req.body;
  let detail = await User.findOne({ password: password, user: user });
  let postDetail = await Post.find({ userid: detail._id });
  if (detail) {
    res.render("userpage.ejs", { detail, postDetail });
  } else {
    res.send("wrong detail entered!");
  }
});

app.get("/user/forgotpassword", (req, res) => {
  res.render("forgot.ejs");
});

app.patch("/user/forgot", async (req, res) => {
  let { email, newpassword } = req.body;
  let detail = await User.findOneAndUpdate(
    { email: email },
    { password: newpassword },
    { runValidators: true },
    { new: true }
  );
  if (detail) {
    res.redirect("/user");
  } else {
    res.send("Wrong email Entered!");
  }
});

//crud operation on user's post

app.get("/user/:id/newpost", async (req, res) => {
  let { id } = req.params;
  let user = await User.findById(id);
  res.render("addpost.ejs", { user });
});

app.post("/user/:id", async (req, res) => {
  let { id } = req.params;
  let detail = await User.findById(id);
  let { title, content } = req.body;
  console.log(title, content);
  let postDetail = new Post({
    userid: id,
    title: title,
    content: content,
  });
  await postDetail.save();
  postDetail = await Post.find({ userid: id });
  console.log(postDetail);
  // await Post.deleteMany({});
  res.render("userpage.ejs", { detail, postDetail });
});

app.get("/user/editpost/:id", async (req, res) => {
  let { id } = req.params;
  let postDetail = await Post.findById(id);
  res.render("editPost.ejs", { postDetail });
  // res.send("working");
});

app.patch("/user/edit/:id", async (req, res) => {
  let { id } = req.params;
  let { title, content } = req.body;
  // console.log(req.body);
  let updateDetail = await Post.findByIdAndUpdate(id, {
    $set: { title: title, content: content },
  });
  let detail = await User.findById(updateDetail.userid);
  let postDetail = await Post.find({ userid: updateDetail.userid });
  res.render("userpage.ejs", { detail, postDetail });
});

app.delete("/user/:id/delete", async (req, res) => {
  let { id } = req.params;
  let deletedPost = await Post.findByIdAndDelete(id);
  let did = deletedPost.userid;
  let detail = await User.findById(did);
  let postDetail = await Post.find({ userid: did });
  res.render("userpage.ejs", { detail, postDetail });
});

//route for likes and comments
app.get("/user/like/:id", async (req, res) => {
  let { id } = req.params;
  let likedetail = await Post.findById(id);
  likedetail = likedetail.likes;
  likedetail += 1;
  likedetail = await Post.findByIdAndUpdate(id, {
    $set: { likes: likedetail },
  });
  let postDetail = await Post.find({ userid: likedetail.userid });
  let detail = await User.findById(likedetail.userid);
  res.render("userpage.ejs", { detail, postDetail });
});

app.get("/user/comment/:id", async (req, res) => {
  let { id } = req.params;
  let post = await Post.findById(id);
  let comments = await Comment.find({ postid: id });
  res.render("comment.ejs", { comments, id });
});

app.get("/user/addcomment/:id", (req, res) => {
  let { id } = req.params;
  res.render("addcomment.ejs", { id });
});

app.post("/user/add/:id", async (req, res) => {
  let { id } = req.params;
  let { from, content } = req.body;
  let comment = new Comment({
    postid: id,
    content: content,
    from: from,
  });
  await comment.save();
  res.redirect(`/user/comment/${id}`);
  // res.send("save");
});

main()
  .then(() => {
    console.log("connection successfull");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/twitter");
}

app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
