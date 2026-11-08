
import { useEffect, useRef, useState } from 'react';

function Messages({ user, goToDashboard }) {
  const currentUserId = String(user?.id || user?._id || '');

  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  // LOAD USERS AND CONVERSATIONS
  const loadSidebar = async () => {
    try {
      const [usersResponse, conversationsResponse] =
        await Promise.all([
          fetch(`http://localhost:5000/api/messages/users/${currentUserId}`),
          fetch(`http://localhost:5000/api/messages/conversations/${currentUserId}`)
        ]);

      if (!usersResponse.ok || !conversationsResponse.ok) {
        throw new Error('Unable to load messages');
      }

      const usersData = await usersResponse.json();
      const conversationsData = await conversationsResponse.json();

      setUsers(usersData);
      setConversations(conversationsData);

    } catch (err) {
      setError(err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadSidebar();
    }
  }, [currentUserId]);

  // LOAD SELECTED CONVERSATION
  const fetchMessages = async (otherUserId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${currentUserId}/${otherUserId}`
      );

      if (!response.ok) {
        throw new Error('Unable to load conversation');
      }

      const data = await response.json();
      setMessages(data);

    } catch (err) {
      setError(err.message);
    }
  };

  const openConversation = async (selected) => {
    setSelectedUser(selected);
    setMessages([]);
    setError('');
    setChatLoading(true);

    await fetchMessages(selected._id);

    setChatLoading(false);
    loadSidebar();
  };

  // SCROLL TO LATEST MESSAGE
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  // SEND MESSAGE
  const handleSend = async (e) => {
    e.preventDefault();

    const text = newMessage.trim();

    if (!text || !selectedUser || sending) return;

    try {
      setSending(true);
      setError('');

      const response = await fetch(
        'http://localhost:5000/api/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            senderId: currentUserId,
            receiverId: selectedUser._id,
            message: text
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Message could not be sent');
      }

      setMessages((previous) => [
        ...previous,
        data.newMessage
      ]);

      setNewMessage('');
      loadSidebar();

    } catch (err) {
      setError(err.message || 'Unable to send message');
    } finally {
      setSending(false);
    }
  };

  // SEARCH USERS AND CONVERSATIONS
  const filteredUsers = users
    .filter((person) =>
      person.name?.toLowerCase().includes(search.toLowerCase()) ||
      person.location?.toLowerCase().includes(search.toLowerCase()) ||
      person.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aConversation = conversations.find(
        (c) => c.user?._id === a._id
      );

      const bConversation = conversations.find(
        (c) => c.user?._id === b._id
      );

      return new Date(bConversation?.lastMessageAt || 0) -
        new Date(aConversation?.lastMessageAt || 0);
    });

  const formatTime = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="min-vh-100"
      style={{ background: '#f3f7f4' }}
    >
      <div className="container py-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

          <div>
            <button
              className="btn btn-outline-success btn-sm mb-3"
              onClick={goToDashboard}
            >
              ← Dashboard
            </button>

            <h2 className="fw-bold mb-1">
              Messages
            </h2>

            <p className="text-muted mb-0">
              Connect with the ClothSwap community.
            </p>
          </div>

          <div
            className="rounded-4 px-4 py-3 d-flex align-items-center gap-3"
            style={{
              background: '#e3f3e8',
              color: '#198754'
            }}
          >
            <span className="fs-3">💬</span>
            <div>
              <div className="fw-bold">Your Inbox</div>
              <small>{conversations.length} conversations</small>
            </div>
          </div>

        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* MESSAGING LAYOUT */}
        <div
          className="row g-0 bg-white rounded-4 shadow-sm overflow-hidden"
          style={{
            minHeight: '650px',
            border: '1px solid #e5eee7'
          }}
        >

          {/* LEFT SIDEBAR */}
          <div
            className="col-md-4 border-end"
            style={{ background: '#ffffff' }}
          >

            <div className="p-4 border-bottom">
              <h5 className="fw-bold mb-3">
                Conversations
              </h5>

              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  🔍
                </span>

                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search people..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                maxHeight: '560px',
                overflowY: 'auto'
              }}
            >

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success"></div>
                  <p className="text-muted mt-3">
                    Loading conversations...
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center p-4">
                  <div className="fs-1">👥</div>
                  <p className="text-muted mt-2">
                    No users found.
                  </p>
                </div>
              ) : (
                filteredUsers.map((person) => {
                  const conversation = conversations.find(
                    (c) => c.user?._id === person._id
                  );

                  const isSelected =
                    selectedUser?._id === person._id;

                  return (
                    <button
                      type="button"
                      key={person._id}
                      onClick={() => openConversation(person)}
                      className="w-100 text-start border-0 border-bottom p-3"
                      style={{
                        background: isSelected ? '#eaf5ed' : '#ffffff',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">

                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                          style={{
                            width: '48px',
                            height: '48px',
                            background: '#198754',
                            fontSize: '18px'
                          }}
                        >
                          {person.name?.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-grow-1 overflow-hidden">

                          <div className="d-flex justify-content-between gap-2">
                            <span className="fw-bold text-dark text-truncate">
                              {person.name}
                            </span>

                            {conversation?.lastMessageAt && (
                              <small className="text-muted">
                                {formatTime(conversation.lastMessageAt)}
                              </small>
                            )}
                          </div>

                          <div className="d-flex justify-content-between align-items-center gap-2">

                            <small className="text-muted text-truncate">
                              {conversation?.lastMessage ||
                                person.location ||
                                'Start a conversation'}
                            </small>

                            {conversation?.unreadCount > 0 && (
                              <span className="badge bg-success rounded-pill">
                                {conversation.unreadCount}
                              </span>
                            )}

                          </div>
                        </div>

                      </div>
                    </button>
                  );
                })
              )}

            </div>
          </div>

          {/* RIGHT CHAT AREA */}
          <div className="col-md-8 d-flex flex-column">

            {selectedUser ? (
              <>

                {/* CHAT HEADER */}
                <div className="d-flex align-items-center gap-3 p-3 border-bottom bg-white">

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      width: '45px',
                      height: '45px',
                      background: '#198754'
                    }}
                  >
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h6 className="fw-bold mb-1">
                      {selectedUser.name}
                    </h6>

                    <small className="text-muted">
                      📍 {selectedUser.location || 'Location not specified'}
                    </small>
                  </div>

                </div>

                {/* MESSAGES */}
                <div
                  className="flex-grow-1 p-4"
                  style={{
                    background: '#f7faf8',
                    minHeight: '420px',
                    maxHeight: '480px',
                    overflowY: 'auto'
                  }}
                >

                  {chatLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-success"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="fs-1">👋</div>

                      <h5 className="fw-bold mt-3">
                        Start a conversation
                      </h5>

                      <p className="text-muted">
                        Send your first message to {selectedUser.name}.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine =
                        msg.sender?._id?.toString() === currentUserId;

                      return (
                        <div
                          key={msg._id}
                          className={`d-flex mb-3 ${
                            isMine
                              ? 'justify-content-end'
                              : 'justify-content-start'
                          }`}
                        >
                          <div
                            style={{
                              maxWidth: '75%',
                              background: isMine ? '#198754' : '#ffffff',
                              color: isMine ? '#ffffff' : '#212529',
                              borderRadius: isMine
                                ? '18px 18px 4px 18px'
                                : '18px 18px 18px 4px',
                              padding: '12px 16px',
                              boxShadow: '0 2px 7px rgba(0,0,0,0.05)',
                              overflowWrap: 'anywhere'
                            }}
                          >

                            <div>{msg.message}</div>

                            <div
                              className="text-end mt-2"
                              style={{
                                fontSize: '10px',
                                color: isMine
                                  ? '#d9f5e3'
                                  : '#888888'
                              }}
                            >
                              {formatTime(msg.createdAt)}
                              {isMine && (
                                <span className="ms-1">
                                  {msg.isRead ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />

                </div>

                {/* MESSAGE INPUT */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-top bg-white"
                >
                  <div className="input-group">

                    <input
                      type="text"
                      className="form-control rounded-start-pill px-4"
                      placeholder={`Message ${selectedUser.name}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />

                    <button
                      type="submit"
                      className="btn btn-success rounded-end-pill px-4"
                      disabled={!newMessage.trim() || sending}
                    >
                      {sending ? 'Sending...' : 'Send ➤'}
                    </button>

                  </div>
                </form>

              </>
            ) : (

              <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center p-4">

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: '100px',
                    height: '100px',
                    background: '#e5f4e9',
                    fontSize: '45px'
                  }}
                >
                  💬
                </div>

                <h4 className="fw-bold">
                  Welcome to ClothSwap Messages
                </h4>

                <p
                  className="text-muted"
                  style={{ maxWidth: '350px' }}
                >
                  Choose a user from the conversation list to start chatting and coordinate your clothing exchanges.
                </p>

                <span className="badge rounded-pill text-success px-3 py-2"
                  style={{ background: '#e5f4e9' }}
                >
                  Connect · Share · Swap
                </span>

              </div>

            )}

          </div>
        </div>

        <p className="text-center text-muted small mt-4">
          🌱 Making fashion more sustainable, one conversation at a time.
        </p>

      </div>
    </div>
  );
}

export default Messages;
