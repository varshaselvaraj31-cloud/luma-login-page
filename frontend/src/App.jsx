import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

async function apiRequest(path, options = {}) {
  const endpoint = `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'The request could not be completed.');
  }

  return result;
}

function BrandMark({ to = '/' }) {
  return (
    <Link aria-label="Luma home" className="brand" to={to}>
      <span aria-hidden="true" className="brand-mark">
        <span />
        <span />
        <span />
      </span>
      <span>luma</span>
    </Link>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError('Please fill in both fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      navigate('/dashboard', { state: { user: result.user } });
    } catch (requestError) {
      setError(requestError.message || 'We could not reach the server. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="streaming-login">
      <div aria-hidden="true" className="cinema-backdrop">
        <div className="backdrop-glow" />
        <div className="poster-wall">
          <div className="poster poster-one"><span>THE<br />QUIET<br />MILE</span><i>01</i></div>
          <div className="poster poster-two"><span>WILD<br />HORIZON</span><i>02</i></div>
          <div className="poster poster-three"><span>AFTER<br />THE<br />GLOW</span><i>03</i></div>
          <div className="poster poster-four"><span>BLUE<br />HOUR</span><i>04</i></div>
          <div className="poster poster-five"><span>SMALL<br />WONDERS</span><i>05</i></div>
          <div className="poster poster-six"><span>FAR<br />FROM<br />ORDINARY</span><i>06</i></div>
          <div className="poster poster-seven"><span>SOFT<br />LANDING</span><i>07</i></div>
          <div className="poster poster-eight"><span>OPEN<br />WATER</span><i>08</i></div>
        </div>
      </div>

      <header className="stream-header">
        <BrandMark />
        <span className="stream-header-label">A GOOD STORY CHANGES EVERYTHING</span>
      </header>

      <section aria-label="Sign in to Luma" className="stream-content">
        <div className="stream-intro">
          <span className="stream-eyebrow"><i /> YOUR NEXT FAVORITE STORY</span>
          <h1>Stay for<br />the <span>story.</span></h1>
          <p>Thoughtful films, fresh perspectives, and a little escape whenever you need it.</p>
          <div className="stream-promise"><span>✳</span> A world of stories, picked for you.</div>
        </div>

        <div className="stream-card">
          <span className="stream-card-kicker">WELCOME BACK</span>
          <h2>Sign in</h2>
          <p className="stream-card-intro">Your next watch is waiting.</p>

          <form className="stream-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Email address</label>
            <input
              autoComplete="email"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />

            <div className="stream-password-label">
              <label htmlFor="password">Password</label>
              <a href="#demo-account">Need help?</a>
            </div>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              type="password"
              value={password}
            />

            {error && (
              <p className="stream-error" role="alert">
                <span aria-hidden="true">!</span>
                {error}
              </p>
            )}

            <button className="stream-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Opening your space…' : 'Continue'}
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="stream-card-divider"><span /> DEMO ACCESS <span /></div>
          <p className="stream-demo" id="demo-account">
            <strong>Take a look around</strong>
            <span>hello@luma.demo <i>·</i> lumademo123</span>
          </p>
          <p className="stream-terms">By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</p>
        </div>
      </section>

      <footer className="stream-footer">
        <span>© 2025 Luma Screen · Stories for the in-between moments.</span>
        <a href="#help">Questions? We’re here to help.</a>
      </footer>
    </main>
  );
}

function CommunityPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const [activeTab, setActiveTab] = useState('For you');
  const [posts, setPosts] = useState([]);
  const [people, setPeople] = useState([]);
  const [following, setFollowing] = useState([]);
  const [viewedStories, setViewedStories] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [postDraft, setPostDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const stories = [
    { username: 'maya.chen', name: 'Maya', initials: 'MC', color: 'coral' },
    { username: 'leo.makes', name: 'Leo', initials: 'LP', color: 'blue' },
    { username: 'amara.outside', name: 'Amara', initials: 'AJ', color: 'gold' },
    { username: 'noah.frames', name: 'Noah', initials: 'NR', color: 'lavender' },
    { username: 'ella.grows', name: 'Ella', initials: 'EG', color: 'mint' },
  ];

  const username = user?.email.split('@')[0];

  useEffect(() => {
    if (!username) return undefined;

    let isCurrent = true;

    async function loadFeed() {
      try {
        const result = await apiRequest(`/feed?user=${encodeURIComponent(username)}`);
        if (!isCurrent) return;
        setPosts(result.posts);
        setPeople(result.people);
        setFollowing(result.following);
      } catch (error) {
        if (isCurrent) setFeedError(error.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadFeed();
    return () => {
      isCurrent = false;
    };
  }, [username]);

  const visiblePosts = posts.filter((post) => {
    if (activeTab === 'Following' && !following.includes(post.author)) return false;
    if (activeTab === 'Saved' && !post.saved) return false;
    return true;
  });

  function toggleItem(items, setItems, item) {
    setItems(items.includes(item) ? items.filter((value) => value !== item) : [...items, item]);
  }

  async function addPost(event) {
    event.preventDefault();
    const caption = postDraft.trim();
    if (!caption) return;

    setFeedError('');
    try {
      const result = await apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify({ username, name: user.name, caption }),
      });
      setPosts((currentPosts) => [result.post, ...currentPosts]);
      setPostDraft('');
      setActiveTab('For you');
    } catch (error) {
      setFeedError(error.message);
    }
  }

  async function toggleLike(post) {
    setFeedError('');
    try {
      const result = await apiRequest(`/posts/${post.id}/like`, {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      setPosts((currentPosts) => currentPosts.map((item) => (
        item.id === post.id ? { ...item, liked: result.liked, likes: result.likes } : item
      )));
    } catch (error) {
      setFeedError(error.message);
    }
  }

  async function toggleSaved(post) {
    setFeedError('');
    try {
      const result = await apiRequest(`/posts/${post.id}/save`, {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      setPosts((currentPosts) => currentPosts.map((item) => (
        item.id === post.id ? { ...item, saved: result.saved } : item
      )));
    } catch (error) {
      setFeedError(error.message);
    }
  }

  async function addComment(event, postId) {
    event.preventDefault();
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;

    setFeedError('');
    try {
      const result = await apiRequest(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ username, name: user.name, text }),
      });
      setPosts((currentPosts) => currentPosts.map((post) => (
        post.id === postId
          ? { ...post, comments: [...post.comments, result.comment], commentsCount: result.commentsCount }
          : post
      )));
      setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: '' }));
    } catch (error) {
      setFeedError(error.message);
    }
  }

  async function toggleFollowing(targetUsername) {
    setFeedError('');
    try {
      const result = await apiRequest('/follows', {
        method: 'POST',
        body: JSON.stringify({ username, targetUsername }),
      });
      setFollowing((currentFollowing) => (
        result.following
          ? [...currentFollowing, targetUsername]
          : currentFollowing.filter((item) => item !== targetUsername)
      ));
    } catch (error) {
      setFeedError(error.message);
    }
  }

  if (!user) {
    return <Navigate replace to="/" />;
  }

  return (
    <main className="social-page">
      <aside className="social-sidebar">
        <BrandMark />
        <nav aria-label="Main navigation" className="social-nav">
          <button className={`social-nav-item ${activeTab === 'For you' || activeTab === 'Following' ? 'active' : ''}`} onClick={() => setActiveTab('For you')} type="button"><span>⌂</span> Home</button>
          <button className={`social-nav-item ${activeTab === 'Explore' ? 'active' : ''}`} onClick={() => setActiveTab('Explore')} type="button"><span>⌕</span> Explore</button>
          <button className={`social-nav-item ${activeTab === 'Saved' ? 'active' : ''}`} onClick={() => setActiveTab('Saved')} type="button"><span>◇</span> Saved</button>
        </nav>
        <button className="sidebar-create" onClick={() => document.getElementById('new-post')?.focus()} type="button">
          <span>＋</span> Create a post
        </button>
        <div className="sidebar-account">
          <div className="avatar avatar-mint">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
          <div><strong>{user.name}</strong><span>{user.email}</span></div>
          <button aria-label="Sign out" onClick={() => navigate('/')} type="button">···</button>
        </div>
      </aside>

      <section aria-label="Community feed" className="social-feed">
        <header className="feed-header">
          <div>
            <span className="feed-kicker">YOUR LITTLE CORNER</span>
            <h1>Good things grow <span>together.</span></h1>
          </div>
          <button className="mobile-sign-out" onClick={() => navigate('/')} type="button">Sign out</button>
        </header>

        <section aria-label="Stories" className="stories-card">
          <div className="section-heading"><h2>Little updates</h2><span>See what’s new</span></div>
          <div className="stories-list">
            {stories.map((story) => (
              <button
                aria-label={`${viewedStories.includes(story.username) ? 'Viewed' : 'View'} ${story.name}'s update`}
                className="story"
                key={story.username}
                onClick={() => toggleItem(viewedStories, setViewedStories, story.username)}
                type="button"
              >
                <span className={`story-ring ${viewedStories.includes(story.username) ? 'story-viewed' : ''}`}>
                  <span className={`avatar avatar-${story.color}`}>{story.initials}</span>
                </span>
                <span>{story.name}</span>
              </button>
            ))}
          </div>
        </section>

        <form className="compose-card" onSubmit={addPost}>
          <div className="avatar avatar-mint">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
          <input
            aria-label="Write a post"
            id="new-post"
            onChange={(event) => setPostDraft(event.target.value)}
            placeholder="Share a thought, a moment, a little joy..."
            value={postDraft}
          />
          <button disabled={!postDraft.trim()} type="submit">Share</button>
        </form>

        <div className="feed-tabs" role="tablist" aria-label="Feed filter">
          {['For you', 'Following', 'Saved'].map((tab) => (
            <button
              aria-selected={activeTab === tab}
              className={activeTab === tab ? 'selected' : ''}
              key={tab}
              onClick={() => setActiveTab(tab)}
              role="tab"
              type="button"
            >{tab}</button>
          ))}
        </div>

        {feedError && <p className="feed-error" role="alert">{feedError}</p>}

        {activeTab === 'Explore' && (
          <section className="explore-note">
            <span className="explore-spark">✳</span>
            <div><strong>A little inspiration, just for you.</strong><p>Meet thoughtful people and find new corners of the community.</p></div>
            <button onClick={() => setActiveTab('For you')} type="button">Back to your feed</button>
          </section>
        )}

        {isLoading ? (
          <div className="empty-feed"><p>Gathering your little corner...</p></div>
        ) : visiblePosts.length === 0 ? (
          <div className="empty-feed">
            <span>✳</span>
            <h2>{activeTab === 'Saved' ? 'Your saved moments will live here.' : 'Your circle is just getting started.'}</h2>
            <p>{activeTab === 'Saved' ? 'Save a post you love and come back to it anytime.' : 'Follow someone from the suggestions to see their updates.'}</p>
          </div>
        ) : visiblePosts.map((post) => {
          const isLiked = post.liked;
          const isSaved = post.saved;
          const author = people.find((person) => person.username === post.author);
          const initials = author?.initials || post.initials;
          const color = author?.color || post.color;

          return (
            <article className="post-card" key={post.id}>
              <header className="post-header">
                <div className={`avatar avatar-${color}`}>{initials}</div>
                <div className="post-author"><strong>{post.name}</strong><span>{post.location}</span></div>
                <button aria-label={`More options for ${post.name}'s post`} className="post-more" type="button">···</button>
              </header>
              <div aria-label={`Colorful illustrated moment shared by ${post.name}`} className={`post-art post-art-${post.color}`} role="img">
                <span className="art-sun" />
                <span className="art-hill art-hill-back" />
                <span className="art-hill art-hill-front" />
                <span className="art-words">{post.color === 'coral' ? 'take the\nscenic route' : post.color === 'blue' ? 'make room\nfor wonder' : 'slow down,\nlook around'}</span>
                <span className="art-stamp">L / {String(post.id % 100).padStart(2, '0')}</span>
              </div>
              <div className="post-actions">
                <button aria-label={isLiked ? 'Unlike post' : 'Like post'} aria-pressed={isLiked} className={isLiked ? 'liked' : ''} onClick={() => toggleLike(post)} type="button">
                  <span aria-hidden="true">{isLiked ? '♥' : '♡'}</span>
                </button>
                <button aria-label="Jump to comment" onClick={() => document.getElementById(`comment-${post.id}`)?.focus()} type="button"><span aria-hidden="true">⌁</span></button>
                <button aria-label="Share post" onClick={() => navigator.clipboard?.writeText(window.location.href)} type="button"><span aria-hidden="true">↗</span></button>
                <button aria-label={isSaved ? 'Remove saved post' : 'Save post'} aria-pressed={isSaved} className={`save-action ${isSaved ? 'saved' : ''}`} onClick={() => toggleSaved(post)} type="button"><span aria-hidden="true">{isSaved ? '◆' : '◇'}</span></button>
              </div>
              <div className="post-copy">
                <strong>{post.likes + (isLiked ? 1 : 0)} appreciations</strong>
                <p><strong>{post.author}</strong> {post.caption}</p>
                <button className="view-comments" onClick={() => document.getElementById(`comment-${post.id}`)?.focus()} type="button">
                  View all {post.commentsCount} notes
                </button>
                {post.comments.map((comment) => (
                  <p className="added-comment" key={comment.id}><strong>{comment.author}</strong> {comment.text}</p>
                ))}
                <time>{post.time.toUpperCase()}</time>
              </div>
              <form className="comment-form" onSubmit={(event) => addComment(event, post.id)}>
                <input
                  aria-label={`Add a note to ${post.name}'s post`}
                  id={`comment-${post.id}`}
                  onChange={(event) => setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [post.id]: event.target.value }))}
                  placeholder="Leave a kind note..."
                  value={commentDrafts[post.id] || ''}
                />
                <button disabled={!(commentDrafts[post.id] || '').trim()} type="submit">Post</button>
              </form>
            </article>
          );
        })}

        <footer className="social-footer">A small space for good things <span>© 2025 Luma</span></footer>
      </section>

      <aside className="community-panel">
        <div className="community-welcome">
          <span className="welcome-spark">✳</span>
          <div><span>MONDAY, ANYTIME</span><h2>Make yourself<br />at home.</h2></div>
          <p>A quieter corner of the internet, made better by you.</p>
        </div>
        <section className="suggestions">
          <div className="section-heading"><h2>People to meet</h2><button onClick={() => setActiveTab('Explore')} type="button">See all</button></div>
          {people.slice(0, 3).map((person) => {
            const isFollowing = following.includes(person.username);
            return (
              <div className="suggestion" key={person.username}>
                <div className={`avatar avatar-${person.color}`}>{person.initials}</div>
                <div className="suggestion-person"><strong>{person.name}</strong><span>@{person.username}</span></div>
                <button aria-pressed={isFollowing} onClick={() => toggleFollowing(person.username)} type="button">{isFollowing ? 'Following' : 'Follow'}</button>
              </div>
            );
          })}
        </section>
        <p className="community-note">Take what inspires you.<br />Leave a little kindness behind.</p>
      </aside>
    </main>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [activeFilter, setActiveFilter] = useState('For you');
  const [query, setQuery] = useState('');
  const [myList, setMyList] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);

  const titles = [
    { id: 'quiet-mile', title: 'The Quiet Mile', type: 'Film', year: '2025', duration: '1h 48m', genre: 'Drama', description: 'A long drive home brings a photographer back to the people and places she thought she had outgrown.', art: 'amber', tag: 'LUMA PREMIERE' },
    { id: 'wild-horizon', title: 'Wild Horizon', type: 'Series', year: '2025', duration: '6 episodes', genre: 'Adventure', description: 'Two friends follow an old trail across the coast and find a different kind of wilderness.', art: 'ocean', tag: 'NEW SEASON' },
    { id: 'after-glow', title: 'After the Glow', type: 'Film', year: '2024', duration: '1h 36m', genre: 'Romance', description: 'One late summer, one little town, and a chance encounter neither of them planned for.', art: 'rose', tag: 'HEARTFELT' },
    { id: 'blue-hour', title: 'Blue Hour', type: 'Series', year: '2025', duration: '8 episodes', genre: 'Mystery', description: 'When the harbor lights go out, a quiet island begins sharing its secrets.', art: 'blue', tag: 'ONLY ON LUMA' },
    { id: 'small-wonders', title: 'Small Wonders', type: 'Film', year: '2023', duration: '1h 52m', genre: 'Documentary', description: 'A gentle portrait of people who make extraordinary things from ordinary days.', art: 'sage', tag: 'A LITTLE JOY' },
    { id: 'far-ordinary', title: 'Far From Ordinary', type: 'Series', year: '2024', duration: '5 episodes', genre: 'Travel', description: 'An artist leaves the city behind to find inspiration in places off the map.', art: 'violet', tag: 'GO SOMEWHERE' },
    { id: 'soft-landing', title: 'Soft Landing', type: 'Film', year: '2025', duration: '1h 41m', genre: 'Comedy', description: 'A fresh start, an unexpected roommate, and a very particular neighborhood cat.', art: 'coral', tag: 'FEEL-GOOD FILM' },
    { id: 'open-water', title: 'Open Water', type: 'Series', year: '2024', duration: '4 episodes', genre: 'Nature', description: 'Meet the divers and ocean keepers protecting the places they call home.', art: 'teal', tag: 'WILD & WONDERFUL' },
  ];

  const featuredTitle = titles[0];
  const filteredTitles = titles.filter((title) => {
    const matchesFilter =
      activeFilter === 'For you' ||
      (activeFilter === 'Films' && title.type === 'Film') ||
      (activeFilter === 'Series' && title.type === 'Series') ||
      (activeFilter === 'My List' && myList.includes(title.id));
    const matchesSearch = `${title.title} ${title.genre} ${title.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!user) {
    return <Navigate replace to="/" />;
  }

  function toggleList(titleId) {
    setMyList((currentList) => (
      currentList.includes(titleId)
        ? currentList.filter((id) => id !== titleId)
        : [...currentList, titleId]
    ));
  }

  return (
    <main className="catalog-page">
      <header className="catalog-nav">
        <BrandMark to="/dashboard" />
        <nav aria-label="Browse titles" className="catalog-links">
          {['For you', 'Films', 'Series', 'My List'].map((filter) => (
            <button
              aria-pressed={activeFilter === filter}
              className={activeFilter === filter ? 'catalog-link selected' : 'catalog-link'}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >{filter}</button>
          ))}
        </nav>
        <div className="catalog-tools">
          <label className="catalog-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search titles"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles"
              value={query}
            />
          </label>
          <span className="catalog-welcome">Hi, {user.name.split(' ')[0]}</span>
          <button aria-label="Sign out" className="catalog-signout" onClick={() => navigate('/')} type="button">↗</button>
        </div>
      </header>

      <section aria-label="Featured title" className={`catalog-hero hero-${featuredTitle.art}`}>
        <div aria-hidden="true" className="hero-landscape">
          <span className="hero-moon" />
          <span className="hero-ridge hero-ridge-back" />
          <span className="hero-ridge hero-ridge-front" />
          <span className="hero-grain" />
        </div>
        <div className="hero-content">
          <span className="hero-eyebrow"><i /> {featuredTitle.tag}</span>
          <p className="hero-overline">A LUMA ORIGINAL FILM</p>
          <h1>{featuredTitle.title}</h1>
          <p className="hero-meta">{featuredTitle.year} <span>•</span> {featuredTitle.duration} <span>•</span> {featuredTitle.genre}</p>
          <p className="hero-description">{featuredTitle.description}</p>
          <div className="hero-buttons">
            <button className="hero-play" onClick={() => setSelectedTitle(featuredTitle)} type="button"><span>▶</span> Play</button>
            <button className="hero-more" onClick={() => setSelectedTitle(featuredTitle)} type="button"><span>ⓘ</span> More info</button>
          </div>
        </div>
        <div className="hero-index"><span>01</span><i /><span>08</span></div>
        <span className="hero-bottom-fade" />
      </section>

      <section aria-label="Browse collection" className="catalog-content">
        <div className="catalog-section-heading">
          <div>
            <span className="catalog-kicker">A GOOD PLACE TO START</span>
            <h2>{query ? `Results for “${query}”` : activeFilter === 'For you' ? 'Picked for your evening' : activeFilter}</h2>
          </div>
          <span className="collection-count">{filteredTitles.length} STORIES</span>
        </div>

        {filteredTitles.length > 0 ? (
          <div className="title-grid">
            {filteredTitles.map((title, index) => (
              <article className="title-card" key={title.id}>
                <button
                  aria-label={`View ${title.title}`}
                  className={`title-art title-art-${title.art}`}
                  onClick={() => setSelectedTitle(title)}
                  type="button"
                >
                  <span className="title-art-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="title-art-glow" />
                  <span className="title-art-copy">{title.title}</span>
                  <span className="title-art-category">{title.genre.toUpperCase()}</span>
                  <span className="title-art-play">▶</span>
                </button>
                <div className="title-card-info">
                  <div><h3>{title.title}</h3><span>{title.year} <i>·</i> {title.type} <i>·</i> {title.duration}</span></div>
                  <button
                    aria-label={myList.includes(title.id) ? `Remove ${title.title} from My List` : `Add ${title.title} to My List`}
                    aria-pressed={myList.includes(title.id)}
                    className={myList.includes(title.id) ? 'list-toggle in-list' : 'list-toggle'}
                    onClick={() => toggleList(title.id)}
                    type="button"
                  >{myList.includes(title.id) ? '✓' : '+'}</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <span>✳</span>
            <h2>{activeFilter === 'My List' && !query ? 'Your list is ready for a story.' : 'No stories found.'}</h2>
            <p>{activeFilter === 'My List' && !query ? 'Add a title with the plus button and it’ll be waiting here.' : 'Try a different title or search term.'}</p>
          </div>
        )}
      </section>

      <footer className="catalog-footer"><span>© 2025 Luma Screen</span><span>Stories for the in-between moments.</span></footer>

      {selectedTitle && (
        <div className="title-dialog-backdrop" onClick={() => setSelectedTitle(null)} role="presentation">
          <section
            aria-labelledby="title-dialog-heading"
            aria-modal="true"
            className={`title-dialog hero-${selectedTitle.art}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button aria-label="Close title details" className="dialog-close" onClick={() => setSelectedTitle(null)} type="button">×</button>
            <div aria-hidden="true" className="dialog-art"><span>{selectedTitle.title}</span></div>
            <div className="dialog-copy">
              <span className="catalog-kicker">{selectedTitle.tag || 'LUMA SCREEN'}</span>
              <h2 id="title-dialog-heading">{selectedTitle.title}</h2>
              <p className="dialog-meta">{selectedTitle.year} <i>·</i> {selectedTitle.type} <i>·</i> {selectedTitle.duration} <i>·</i> {selectedTitle.genre}</p>
              <p>{selectedTitle.description}</p>
              <button className="hero-play" onClick={() => setSelectedTitle(null)} type="button"><span>▶</span> Start watching</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const pageTitles = {
      '/dashboard': 'Browse — Luma Screen',
      '/community': 'Community — Luma',
    };
    document.title = pageTitles[location.pathname] || 'Sign in — Luma Screen';
  }, [location.pathname]);

  return (
    <Routes>
      <Route element={<LoginPage />} path="/" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<CommunityPage />} path="/community" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
