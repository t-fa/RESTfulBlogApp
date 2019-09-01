var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer");

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	date: {type: Date, default: Date.now()}
});

var Blog = mongoose.model("Blog", blogSchema);

// ROUTES
app.get("/", function(req, res){
	res.redirect("/blogs");
});

// INDEX route
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	})
});

// NEW route
app.get("/blogs/new", function(req, res){
	res.render("new");
});

// CREATE route
app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err) {
			console.log(err);
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

// SHOW route
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			console.log(err);
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog})
		}
	});
});

// EDIT route
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			console.log(err);
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

// UPDATE route
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err) {
			console.log(err);
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
})

// DELETE route
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

app.listen(3000, process.env.IP, function(){
	console.log("Server is running");
});