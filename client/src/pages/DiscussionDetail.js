import React, { useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './DiscussionDetail.css';

const DiscussionDetail = () => {
  const { topicId } = useParams();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [newReply, setNewReply] = useState('');
  const [replies, setReplies] = useState([
    {
      id: 1,
      author: 'Sarah Ahmed',
      content: 'Great question! I just went through the application process last year. The key is to start early and be very organized with your documents.',
      timestamp: '2 hours ago',
      likes: 5,
      avatar: 'SA'
    },
    {
      id: 2,
      author: 'Mohammad Rahman',
      content: 'I agree with Sarah. Also, make sure to tailor your personal statement for each university. Generic statements rarely work.',
      timestamp: '1 hour ago',
      likes: 3,
      avatar: 'MR'
    },
    {
      id: 3,
      author: 'Fatima Khan',
      content: 'Has anyone here applied to Canadian universities? I\'m particularly interested in the University of Toronto and UBC.',
      timestamp: '45 minutes ago',
      likes: 2,
      avatar: 'FK'
    },
    {
      id: 4,
      author: 'Arif Hassan',
      content: '@Fatima Khan Yes! I got accepted to UofT last year. The application process is quite straightforward, but make sure you meet all the English proficiency requirements.',
      timestamp: '30 minutes ago',
      likes: 4,
      avatar: 'AH'
    }
  ]);

  // Mock topic data - in real app this would come from API
  const topic = {
    id: topicId,
    title: 'University Application Tips',
    category: 'Applications',
    author: 'Sarah Ahmed',
    content: 'Hi everyone! I\'m starting my university application process and feeling a bit overwhelmed. Can anyone share their best tips for a successful application? What are the most important things to focus on?',
    timestamp: '3 hours ago',
    posts: 45,
    views: 234,
    likes: 12
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to join the discussion');
      return;
    }
    
    if (newReply.trim()) {
      const reply = {
        id: replies.length + 1,
        author: user?.name || 'Anonymous User',
        content: newReply,
        timestamp: 'Just now',
        likes: 0,
        avatar: user?.name?.split(' ').map(n => n[0]).join('') || 'AU'
      };
      setReplies([...replies, reply]);
      setNewReply('');
    }
  };

  const handleLike = (replyId) => {
    if (!isAuthenticated) {
      alert('Please log in to like posts');
      return;
    }
    
    setReplies(replies.map(reply => 
      reply.id === replyId 
        ? { ...reply, likes: reply.likes + 1 }
        : reply
    ));
  };

  return (
    <div className="discussion-detail">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/community">Community</Link>
          <span className="separator">›</span>
          <span className="current">Discussion</span>
        </div>

        {/* Topic Header */}
        <div className="topic-header">
          <div className="topic-category">
            <span className="category-badge">{topic.category}</span>
          </div>
          <h1 className="topic-title">{topic.title}</h1>
          <div className="topic-meta">
            <div className="author-info">
              <div className="author-avatar">
                <span>{topic.author.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="author-details">
                <span className="author-name">{topic.author}</span>
                <span className="post-time">{topic.timestamp}</span>
              </div>
            </div>
            <div className="topic-stats">
              <span className="stat">
                <span className="icon">💬</span>
                {topic.posts} posts
              </span>
              <span className="stat">
                <span className="icon">👁️</span>
                {topic.views} views
              </span>
              <span className="stat">
                <span className="icon">❤️</span>
                {topic.likes} likes
              </span>
            </div>
          </div>
        </div>

        {/* Original Post */}
        <div className="original-post">
          <div className="post-content">
            <p>{topic.content}</p>
          </div>
          <div className="post-actions">
            <button 
              className="action-btn like-btn"
              onClick={() => handleLike('original')}
              disabled={!isAuthenticated}
            >
              <span className="icon">❤️</span>
              Like ({topic.likes})
            </button>
            <button className="action-btn share-btn">
              <span className="icon">🔗</span>
              Share
            </button>
          </div>
        </div>

        {/* Replies Section */}
        <div className="replies-section">
          <div className="replies-header">
            <h3>Replies ({replies.length})</h3>
            <div className="sort-options">
              <select className="sort-select">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-liked">Most Liked</option>
              </select>
            </div>
          </div>

          <div className="replies-list">
            {replies.map(reply => (
              <div key={reply.id} className="reply-card">
                <div className="reply-avatar">
                  <span>{reply.avatar}</span>
                </div>
                <div className="reply-content">
                  <div className="reply-header">
                    <span className="reply-author">{reply.author}</span>
                    <span className="reply-time">{reply.timestamp}</span>
                  </div>
                  <div className="reply-text">
                    <p>{reply.content}</p>
                  </div>
                  <div className="reply-actions">
                    <button 
                      className="action-btn like-btn"
                      onClick={() => handleLike(reply.id)}
                      disabled={!isAuthenticated}
                    >
                      <span className="icon">❤️</span>
                      {reply.likes > 0 && reply.likes}
                    </button>
                    <button className="action-btn reply-btn">
                      <span className="icon">💬</span>
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Form */}
        <div className="reply-form-section">
          {isAuthenticated ? (
            <form onSubmit={handleSubmitReply} className="reply-form">
              <div className="form-header">
                <h4>Join the Discussion</h4>
              </div>
              <div className="form-content">
                <div className="user-avatar">
                  <span>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</span>
                </div>
                <div className="form-input">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Share your thoughts, experiences, or ask questions..."
                    rows="4"
                    required
                  />
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      <span className="icon">📝</span>
                      Post Reply
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="login-prompt">
              <div className="prompt-content">
                <h4>Join the Discussion</h4>
                <p>Please log in to participate in this discussion and share your thoughts.</p>
                <div className="prompt-actions">
                  <Link to="/login" className="login-btn">
                    Log In
                  </Link>
                  <Link to="/signup" className="signup-btn">
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Topics */}
        <div className="related-topics">
          <h4>Related Discussions</h4>
          <div className="related-list">
            <Link to="/community/discussion/2" className="related-item">
              <span className="related-title">IELTS Preparation Strategies</span>
              <span className="related-category">Test Prep</span>
            </Link>
            <Link to="/community/discussion/3" className="related-item">
              <span className="related-title">Scholarship Opportunities 2024</span>
              <span className="related-category">Scholarships</span>
            </Link>
            <Link to="/community/discussion/4" className="related-item">
              <span className="related-title">Life in Canada - Student Experiences</span>
              <span className="related-category">Student Life</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;