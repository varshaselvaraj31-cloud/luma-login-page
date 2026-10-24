import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT) || 3001;
const isVercel = process.env.VERCEL === '1';
const clientBuildPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');

const demoAccount = {
  email: 'hello@luma.demo',
  password: 'lumademo123',
};

const people = [
  { username: 'maya.chen', name: 'Maya Chen', initials: 'MC', color: 'coral' },
  { username: 'leo.makes', name: 'Leo Park', initials: 'LP', color: 'blue' },
  { username: 'amara.outside', name: 'Amara James', initials: 'AJ', color: 'gold' },
  { username: 'noah.frames', name: 'Noah Rivera', initials: 'NR', color: 'lavender' },
];

const posts = [
  {
    id: 1,
    author: 'maya.chen',
    name: 'Maya Chen',
    initials: 'MC',
    color: 'coral',
    location: 'Big Sur, California',
    caption: 'A slow morning, a long walk, and nowhere else I need to be. 🌿',
    likes: 284,
    likedBy: new Set(),
    commentsCount: 18,
    comments: [],
    time: '2 hours ago',
  },
  {
    id: 2,
    author: 'leo.makes',
    name: 'Leo Park',
    initials: 'LP',
    color: 'blue',
    location: 'Studio notes',
    caption: 'A reminder to leave a little white space. The best ideas tend to find it.',
    likes: 167,
    likedBy: new Set(),
    commentsCount: 12,
    comments: [],
    time: '5 hours ago',
  },
  {
    id: 3,
    author: 'amara.outside',
    name: 'Amara James',
    initials: 'AJ',
    color: 'gold',
    location: 'Joshua Tree',
    caption: 'The desert has its own way of telling you to take your time.',
    likes: 391,
    likedBy: new Set(),
    commentsCount: 32,
    comments: [],
    time: 'Yesterday',
  },
];

const savedPosts = new Map();
const followingByUser = new Map();
let nextPostId = posts.length + 1;
let nextCommentId = 1;

app.use(express.json({ limit: '20kb' }));

function readUsername(value) {
  if (typeof value !== 'string') return null;
  const username = value.trim();
  return /^[a-zA-Z0-9._-]{1,30}$/.test(username) ? username : null;
}

function findPost(id) {
  const postId = Number(id);
  return Number.isSafeInteger(postId) ? posts.find((post) => post.id === postId) : undefined;
}

function serializePost(post, username, savedByUser) {
  return {
    id: post.id,
    author: post.author,
    name: post.name,
    initials: post.initials,
    color: post.color,
    location: post.location,
    caption: post.caption,
    likes: post.likes,
    liked: post.likedBy.has(username),
    comments: post.comments,
    commentsCount: post.commentsCount + post.comments.length,
    saved: savedByUser.has(post.id),
    time: post.time,
  };
}

app.post('/api/login', (request, response) => {
  const { email, password } = request.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return response.status(400).json({ message: 'Enter your email and password.' });
  }

  const isValidLogin =
    email.trim().toLowerCase() === demoAccount.email &&
    password === demoAccount.password;

  if (!isValidLogin) {
    return response.status(401).json({ message: 'That email and password do not match.' });
  }

  return response.json({
    user: { email: demoAccount.email, name: 'Luma Explorer' },
  });
});

app.get('/api/feed', (request, response) => {
  const username = readUsername(request.query.user);
  if (!username) {
    return response.status(400).json({ message: 'A valid user is required to load the feed.' });
  }

  const followed = followingByUser.get(username) || new Set();
  const savedByUser = savedPosts.get(username) || new Set();

  return response.json({
    posts: posts.map((post) => serializePost(post, username, savedByUser)),
    people: people.filter((person) => person.username !== username),
    following: [...followed],
  });
});

app.post('/api/posts', (request, response) => {
  const { caption, name, username } = request.body ?? {};
  const author = readUsername(username);

  if (!author || typeof name !== 'string' || !name.trim() || name.trim().length > 60) {
    return response.status(400).json({ message: 'A valid author name is required.' });
  }
  if (typeof caption !== 'string' || !caption.trim() || caption.trim().length > 500) {
    return response.status(400).json({ message: 'Posts must have between 1 and 500 characters.' });
  }

  const initials = name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const post = {
    id: nextPostId++,
    author,
    name: name.trim(),
    initials,
    color: 'mint',
    location: 'Just now',
    caption: caption.trim(),
    likes: 0,
    likedBy: new Set(),
    commentsCount: 0,
    comments: [],
    time: 'Just now',
  };

  posts.unshift(post);
  return response.status(201).json({ post: serializePost(post, author, savedPosts.get(author) || new Set()) });
});

app.post('/api/posts/:id/like', (request, response) => {
  const post = findPost(request.params.id);
  const username = readUsername(request.body?.username);
  if (!post) return response.status(404).json({ message: 'Post not found.' });
  if (!username) return response.status(400).json({ message: 'A valid user is required.' });

  if (post.likedBy.has(username)) {
    post.likedBy.delete(username);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.likedBy.add(username);
    post.likes += 1;
  }

  return response.json({ liked: post.likedBy.has(username), likes: post.likes });
});

app.post('/api/posts/:id/save', (request, response) => {
  const post = findPost(request.params.id);
  const username = readUsername(request.body?.username);
  if (!post) return response.status(404).json({ message: 'Post not found.' });
  if (!username) return response.status(400).json({ message: 'A valid user is required.' });

  if (!savedPosts.has(username)) savedPosts.set(username, new Set());
  const userSavedPosts = savedPosts.get(username);
  if (userSavedPosts.has(post.id)) {
    userSavedPosts.delete(post.id);
  } else {
    userSavedPosts.add(post.id);
  }

  return response.json({ saved: userSavedPosts.has(post.id) });
});

app.post('/api/posts/:id/comments', (request, response) => {
  const post = findPost(request.params.id);
  const { name, text, username } = request.body ?? {};
  const author = readUsername(username);
  if (!post) return response.status(404).json({ message: 'Post not found.' });
  if (!author || typeof name !== 'string' || !name.trim() || name.trim().length > 60) {
    return response.status(400).json({ message: 'A valid author name is required.' });
  }
  if (typeof text !== 'string' || !text.trim() || text.trim().length > 300) {
    return response.status(400).json({ message: 'Comments must have between 1 and 300 characters.' });
  }

  const comment = {
    id: nextCommentId++,
    author,
    name: name.trim(),
    text: text.trim(),
  };
  post.comments.push(comment);

  return response.status(201).json({
    comment,
    commentsCount: post.commentsCount + post.comments.length,
  });
});

app.post('/api/follows', (request, response) => {
  const username = readUsername(request.body?.username);
  const targetUsername = readUsername(request.body?.targetUsername);
  if (!username || !targetUsername) {
    return response.status(400).json({ message: 'Valid users are required to follow someone.' });
  }
  if (username === targetUsername || !people.some((person) => person.username === targetUsername)) {
    return response.status(404).json({ message: 'That community member could not be found.' });
  }

  if (!followingByUser.has(username)) followingByUser.set(username, new Set());
  const followedUsers = followingByUser.get(username);
  if (followedUsers.has(targetUsername)) {
    followedUsers.delete(targetUsername);
  } else {
    followedUsers.add(targetUsername);
  }

  return response.json({ following: followedUsers.has(targetUsername) });
});

if (!isVercel && existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

if (!isVercel) {
  app.listen(port, () => {
    console.log(`Luma API listening on http://localhost:${port}`);
  });
}

export default app;
