const express = require("express");
const fs = require("fs");
const path = require("path");
const port =process.env.PORT
const app = express();
const feedbackDir = path.join(__dirname, "feedback");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Create the feedback folder if it doesn't exist.
fs.mkdirSync(feedbackDir, { recursive: true });

// Form page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Save feedback as feedback/<lowercase-title>.txt.
// Existing files are not overwritten.
app.post("/save", (req, res) => {
  const title = String(req.body.title || "").trim().toLowerCase();
  const content = String(req.body.content || "").toLowerCase();

  if (!title || !content.trim()) {
    return res.status(400).send("Title and content are required.");
  }

  // Keep titles as safe filenames; reject path separators and other unsafe characters.
  if (!/^[a-z0-9 _-]+$/.test(title)) {
    return res.status(400).send(
      "Title can contain only letters, numbers, spaces, underscores, and hyphens."
    );
  }

  const filename = `${title}.txt`;
  const filePath = path.join(feedbackDir, filename);

  // "wx" creates the file only if it does not already exist.
  fs.writeFile(filePath, content, { flag: "wx", encoding: "utf8" }, (err) => {
    if (err && err.code === "EEXIST") {
      return res.status(409).send(
        `A feedback file for "${title}" already exists. Choose another title.`
      );
    }
    if (err) {
      console.error(err);
      return res.status(500).send("Could not save feedback.");
    }

    res.redirect(`/feedback/${encodeURIComponent(filename)}`);
  });
});

// Serve saved .txt files in the browser.
app.get("/feedback/:filename", (req, res) => {
  const filename = req.params.filename;

  // Only allow simple .txt filenames, not paths.
  if (!/^[a-z0-9 _-]+\.txt$/.test(filename)) {
    return res.status(400).send("Invalid feedback filename.");
  }

  const filePath = path.join(feedbackDir, filename);
  res.type("text/plain; charset=utf-8");
  res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      res.status(err.statusCode === 404 ? 404 : 500).send("Feedback file not found.");
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
