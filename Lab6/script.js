// ---------- Cookie helpers ----------

// Save a cookie for 30 days
function setCookie(name, value) {
  const days = 30;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/; SameSite=Lax";
}

// Read a cookie, or return null if it does not exist
function getCookie(name) {
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

// Delete a cookie by giving it an old expiry date
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
}

// ---------- Initial state ----------

// Starting counts (votes from other visitors)
const BASE_LIKES = 100;
const BASE_DISLIKES = 20;

let likes = BASE_LIKES;
let dislikes = BASE_DISLIKES;
let comments = [];

const likeBtn = document.getElementById("like-btn");
const dislikeBtn = document.getElementById("dislike-btn");
const likeCount = document.getElementById("like-count");
const dislikeCount = document.getElementById("dislike-count");
const voteMessage = document.getElementById("vote-message");
const commentInput = document.getElementById("comment-input");
const submitBtn = document.getElementById("submit-btn");
const resetBtn = document.getElementById("reset-btn");
const commentMessage = document.getElementById("comment-message");
const commentsList = document.getElementById("comments-list");

// ---------- UI update ----------

function updateUI() {
  const vote = getCookie("vote");

  likeCount.textContent = likes;
  dislikeCount.textContent = dislikes;

  // After one vote, both buttons are locked so the user cannot vote twice
  likeBtn.disabled = vote !== null;
  dislikeBtn.disabled = vote !== null;
  likeBtn.classList.toggle("chosen", vote === "like");
  dislikeBtn.classList.toggle("chosen", vote === "dislike");

  if (vote !== null) {
    voteMessage.textContent = "You already voted: " + vote + ". Press Clear to vote again.";
  }

  // After one comment, the input is locked so the user cannot comment again
  const hasCommented = getCookie("commented") === "true";
  commentInput.disabled = hasCommented;
  submitBtn.disabled = hasCommented;
  if (hasCommented) {
    commentInput.placeholder = "You already left a comment. Press Clear to write a new one.";
  } else {
    commentInput.placeholder = "Write a comment...";
  }

  // Show the comments with the DOM API (textContent keeps the text safe)
  commentsList.innerHTML = "";
  for (const comment of comments) {
    const li = document.createElement("li");
    li.textContent = comment;
    commentsList.appendChild(li);
  }
}

// ---------- Load the saved state from cookies ----------

function loadState() {
  const vote = getCookie("vote");
  if (vote === "like") likes++;
  if (vote === "dislike") dislikes++;

  const savedComments = getCookie("comments");
  comments = savedComments ? JSON.parse(savedComments) : [];

  updateUI();
}

// ---------- Like / dislike ----------

function handleVote(type) {
  if (getCookie("vote") !== null) {
    voteMessage.textContent = "You can only vote once.";
    return;
  }

  if (type === "like") {
    likes++;
  } else {
    dislikes++;
  }
  setCookie("vote", type);

  const button = type === "like" ? likeBtn : dislikeBtn;
  button.classList.add("pop");
  button.addEventListener("animationend", () => button.classList.remove("pop"), { once: true });

  voteMessage.textContent = "Thanks for your vote!";
  updateUI();
}

likeBtn.addEventListener("click", () => handleVote("like"));
dislikeBtn.addEventListener("click", () => handleVote("dislike"));

// ---------- Comments ----------

submitBtn.addEventListener("click", () => {
  const text = commentInput.value.trim();

  if (getCookie("commented") === "true") {
    commentMessage.textContent = "You can only comment once.";
    return;
  }
  if (text === "") {
    commentMessage.textContent = "Please write a comment first.";
    return;
  }

  comments.push(text);
  setCookie("comments", JSON.stringify(comments));
  setCookie("commented", "true");

  commentInput.value = "";
  commentMessage.textContent = "Your comment was added.";
  updateUI();
});

// ---------- Reset ----------

resetBtn.addEventListener("click", () => {
  deleteCookie("vote");
  deleteCookie("comments");
  deleteCookie("commented");

  likes = BASE_LIKES;
  dislikes = BASE_DISLIKES;
  comments = [];
  commentInput.value = "";

  voteMessage.textContent = "";
  commentMessage.textContent = "Your vote and comments were cleared. You can vote again.";
  updateUI();
});

loadState();
