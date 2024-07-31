import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import './styles.css';
import Preloader from './Preloader'; 

function BlogPostDetail({ blogPosts }) {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    console.log("Post ID from URL:", id); // Debug log
    const postDetail = blogPosts.find(post => post.id === parseInt(id));
    console.log("Post Detail:", postDetail); // Debug log
    setPost(postDetail);
  }, [id, blogPosts]);

  if (!post) {
    return <p>Post not found.</p>;
  }

  return (
    <div className="post-detail">
      <h1>{post.title}</h1>
      <img src={post.image} alt={post.title} className="post-image" />
      <p>{post.content}</p>
      <p>Posted on {post.date} by {post.author}</p>
      <div className="comments">
        <h3>Comments:</h3>
        <ul>
          {post.comments && post.comments.map((comment) => (
            <li key={comment.id}>
              {comment.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [blogPosts, setBlogPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    author: '',
    image: '',
  });
  const [newComment, setNewComment] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false); // State for create post modal
  const [isLoading, setIsLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false); // State for comment modal

  // State to store new posts
  const [newPosts, setNewPosts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    axios.get('http://localhost:3001/api/posts')
      .then((response) => {
        const posts = response.data;
        console.log("Fetched posts:", posts); // Debug log
        setBlogPosts(posts);
        setFilteredPosts(posts);

        // Assuming posts have a 'createdAt' field to determine new posts
        const recentPosts = posts.filter(post => new Date(post.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        setNewPosts(recentPosts);
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
      });

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredPosts(blogPosts);
    } else {
      setFilteredPosts(blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm, blogPosts]);

  const handleLike = (postId) => {
    axios.post(`http://localhost:3001/api/posts/${postId}/like`)
      .then((response) => {
        setBlogPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: response.data.likes } : post
          )
        );
      })
      .catch((error) => {
        console.error('Error liking post:', error);
      });
  };

  const handleAddComment = () => {
    if (selectedPostId !== null) {
      axios.post(`http://localhost:3001/api/posts/${selectedPostId}/comments`, { content: newComment })
        .then((response) => {
          console.log("Comment added:", response.data); // Debug log
          setBlogPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === selectedPostId ? { ...post, comments: [...post.comments, response.data] } : post
            )
          );
          setNewComment('');
          setShowCommentModal(false);
          setSelectedPostId(null);
        })
        .catch((error) => {
          console.error('Error adding comment:', error);
        });
    }
  };

  const handleCreatePost = (event) => {
    event.preventDefault();
    console.log("Creating post:", newPost); // Debug log
    axios.post('http://localhost:3001/api/posts', newPost)
      .then((response) => {
        console.log("Post created:", response.data); // Debug log
        setBlogPosts((prevPosts) => [...prevPosts, response.data]);
        setNewPost({
          title: '',
          content: '',
          author: '',
          image: '',
        });
        setShowCreatePostModal(false);
      })
      .catch((error) => {
        console.error('Error creating post:', error);
      });
  };

  const handleToggleCreatePostModal = () => {
    setShowCreatePostModal((prevShow) => !prevShow);
  };

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <Router>
      <div className="container">
        <nav className="navbar">
          <div className="logo">
            <img src="logo.png" alt="Blog Logo" />
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="#" onClick={handleToggleCreatePostModal}>Create Post</Link></li>
            <li>
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>
            </li>
          </ul>
        </nav>

        <section className="hero-section">
          <h1>You’ve Entered the Blog Zone – Hold On Tight!</h1>
          <p>Beam yourself up to a galaxy of groovy posts and quirky content!</p>
        </section>

        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* New Posts Section */}
                {newPosts.length > 0 && (
                  <section className="new-posts-section">
                    <h1>New Posts</h1>
                    <ul className="blog-posts">
                      {newPosts.map((post) => (
                        <li key={post.id} className="blog-post">
                          <Link to={`/post/${post.id}`}>
                            <img src={post.image} alt={post.title} className="post-image" />
                          </Link>
                          <div className="post-content">
                            <div className="post-actions">
                              <div className="action-buttons">
                                <FontAwesomeIcon
                                  icon={faThumbsUp}
                                  className="action-icon"
                                  onClick={() => handleLike(post.id)}
                                />
                                <span>{post.likes}</span>
                                <FontAwesomeIcon
                                  icon={faComment}
                                  className="action-icon"
                                  onClick={() => {
                                    setSelectedPostId(post.id);
                                    setShowCommentModal(true);
                                  }}
                                />
                              </div>
                              <h2>{post.title}</h2>
                              <p>{post.content}</p>
                              <p>Posted on {post.date} by {post.author}</p>
                            </div>

                            <div className="comments">
                              <h3>Comments:</h3>
                              <ul>
                                {post.comments && post.comments.map((comment) => (
                                  <li key={comment.id}>
                                    {comment.content}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Recent Blogs Section */}
                <section className="recent-blogs-section">
                  <h1>Recent Blogs</h1>
                  <ul className="blog-posts">
                    {filteredPosts.length > 0 ? (
                      filteredPosts.map((post) => (
                        <li key={post.id} className="blog-post">
                          <Link to={`/post/${post.id}`}>
                            <img src={post.image} alt={post.title} className="post-image" />
                          </Link>
                          <div className="post-content">
                            <div className="post-actions">
                              <div className="action-buttons">
                                <FontAwesomeIcon
                                  icon={faThumbsUp}
                                  className="action-icon"
                                  onClick={() => handleLike(post.id)}
                                />
                                <span>{post.likes}</span>
                                <FontAwesomeIcon
                                  icon={faComment}
                                  className="action-icon"
                                  onClick={() => {
                                    setSelectedPostId(post.id);
                                    setShowCommentModal(true);
                                  }}
                                />
                                
                              </div>
                              <h2>{post.title}</h2>
                              <p>{post.content}</p>
                              <p>Posted on {post.date} by {post.author}</p>
                            </div>

                            <div className="comments">
                              <h3>Comments:</h3>
                              <ul>
                                {post.comments && post.comments.map((comment) => (
                                  <li key={comment.id}>
                                    {comment.content}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li>No posts available</li>
                    )}
                  </ul>
                </section>
              </>
            }
          />
          <Route path="/post/:id" element={<BlogPostDetail blogPosts={blogPosts} />} />
        </Routes>

        {showCreatePostModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Create New Post</h2>
              <form onSubmit={handleCreatePost}>
                <input
                  type="text"
                  placeholder="Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                <textarea
                  placeholder="Content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={newPost.author}
                  onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={newPost.image}
                  onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                />
                <button type="submit">Create Post</button>
                <button type="button" onClick={handleToggleCreatePostModal}>Close</button>
              </form>
            </div>
          </div>
        )}

        {showCommentModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Add Comment</h2>
              <textarea
                placeholder="Add your comment here"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={handleAddComment}>Add Comment</button>
              <button onClick={() => setShowCommentModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default Home;
