import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faThumbsUp, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Update import for delete icon
import './styles.css';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [blogPosts, setBlogPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    author: '',
    image: '',
  });
  const [newComment, setNewComment] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3001/api/posts')
      .then((response) => {
        setBlogPosts(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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
        console.error(error);
      });
  };

  const handleAddComment = (postId) => {
    axios.post(`http://localhost:3001/api/posts/${postId}/comments`, { content: newComment })
      .then((response) => {
        setBlogPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? response.data : post
          )
        );
        setNewComment('');
        setSelectedPostId(null);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteComment = (postId, commentId) => {
    axios.delete(`http://localhost:3001/api/posts/${postId}/comments/${commentId}`)
      .then((response) => {
        setBlogPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? response.data : post
          )
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCreatePost = (event) => {
    event.preventDefault();
    axios.post('http://localhost:3001/api/posts', newPost)
      .then((response) => {
        setBlogPosts((prevPosts) => [...prevPosts, response.data]);
        setNewPost({
          title: '',
          content: '',
          author: '',
          image: '',
        });
        setShowCreatePost(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleToggleCreatePost = () => {
    setShowCreatePost((prevShow) => !prevShow);
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">
          <img src="logo.png" alt="Blog Logo" />
          <h2>My Blog</h2>
        </div>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#" onClick={handleToggleCreatePost}>Create Post</a></li>
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
        <h1>Welcome to My Blog</h1>
        <p>Explore the latest posts and join the conversation</p>
      </section>

      <h1>Recent Blogs</h1>
      <ul className="blog-posts">
        {blogPosts.length > 0 ? (
          blogPosts.slice(0, 4).map((post) => (
            <li key={post.id} className="blog-post">
              <img src={post.image} alt={post.title} className="post-image" />
              <div className="post-content">
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <p>Posted on {post.date} by {post.author}</p>
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
                      onClick={() => setSelectedPostId(post.id)}
                    />
                  </div>
                  {selectedPostId === post.id && (
                    <div className="comment-form">
                      <textarea
                        placeholder="Add a comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button onClick={() => handleAddComment(post.id)}>
                        <FontAwesomeIcon icon={faComment} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="comments">
                  <h3>Comments:</h3>
                  <ul>
                    {post.comments && post.comments.map((comment) => (
                      <li key={comment.id}>
                        {comment.content}
                        <button
                          className="delete-comment-button"
                          onClick={() => handleDeleteComment(post.id, comment.id)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
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

      {showCreatePost && (
        <div className="create-post-form">
          <h1>Create a New Post</h1>
          <form onSubmit={handleCreatePost}>
            <input
              type="text"
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost((prevPost) => ({ ...prevPost, title: e.target.value }))}
            />
            <textarea
              placeholder="Content"
              value={newPost.content}
              onChange={(e) => setNewPost((prevPost) => ({ ...prevPost, content: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Author"
              value={newPost.author}
              onChange={(e) => setNewPost((prevPost) => ({ ...prevPost, author: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newPost.image}
              onChange={(e) => setNewPost((prevPost) => ({ ...prevPost, image: e.target.value }))}
            />
            <button type="submit">Create Post</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Home;




