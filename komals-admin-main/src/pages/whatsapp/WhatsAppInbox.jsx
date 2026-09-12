import { useState, useEffect, useRef } from 'react';
import {
  Search,
  MessageSquare,
  Send,
  Check,
  CheckCheck,
  Phone,
  RefreshCw,
  AlertCircle,
  Plus,
  X,
  UserPlus
} from 'lucide-react';
import { whatsappService, friendlyError } from '../../lib/whatsappApi.js';

export default function WhatsAppInbox() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // New Chat Modal State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatForm, setNewChatForm] = useState({ name: '', phone: '', message: '' });
  const [startingChat, setStartingChat] = useState(false);

  const messagesEndRef = useRef(null);

  // Load conversations list
  const fetchConversations = async () => {
    try {
      setError(null);
      const list = await whatsappService.getConversations();
      setConversations(list);
      if (list.length > 0 && !activeConv) {
        setActiveConv(list[0]);
      } else if (list.length === 0) {
        setActiveConv(null);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError(friendlyError(err, 'load conversations'));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 6000);
    return () => clearInterval(interval);
  }, []);

  // Load active conversation messages
  useEffect(() => {
    if (!activeConv?.id) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setLoadingMessages(true);

    whatsappService.getMessages(activeConv.id)
      .then((msgs) => {
        if (isMounted) {
          setMessages(msgs);
          setLoadingMessages(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load messages:', err);
        if (isMounted) setLoadingMessages(false);
      });

    // Delivery/read/failed status arrives asynchronously via Meta's status
    // webhook, after the initial send already looked successful — poll so
    // a message's tick (or "Not delivered") actually updates on screen
    // without the agent having to click away and back.
    const poll = setInterval(() => {
      whatsappService.getMessages(activeConv.id)
        .then((msgs) => { if (isMounted) setMessages(msgs); })
        .catch(() => {});
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(poll);
    };
  }, [activeConv?.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send reply message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !activeConv || sending) return;

    const outgoingText = messageText.trim();
    setMessageText('');
    setSending(true);

    const optimisticMsg = {
      id: 'opt_' + Date.now(),
      conversationId: activeConv.id,
      direction: 'outbound',
      contentText: outgoingText,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await whatsappService.sendMessage(activeConv.id, {
        conversation_id: activeConv.id,
        content_text: outgoingText,
        message_type: 'text',
      });
      const updated = await whatsappService.getMessages(activeConv.id);
      setMessages(updated);
    } catch (err) {
      console.error('Failed to send WhatsApp message:', err);
      alert(friendlyError(err, 'send message'));
    } finally {
      setSending(false);
    }
  };

  // Start brand new chat by phone number
  const handleStartNewChat = async (e) => {
    e.preventDefault();
    if (!newChatForm.phone.trim() || !newChatForm.message.trim() || startingChat) return;

    setStartingChat(true);
    try {
      // 1. Create or ensure contact exists
      const contact = await whatsappService.createContact({
        name: newChatForm.name.trim() || undefined,
        phone: newChatForm.phone.trim(),
      });

      const contactId = contact?.id || contact?.contact?.id;

      // 2. Dispatch the WhatsApp message
      await whatsappService.sendMessage(null, {
        contact_id: contactId,
        content_text: newChatForm.message.trim(),
        message_type: 'text',
      });

      setShowNewChatModal(false);
      setNewChatForm({ name: '', phone: '', message: '' });

      // 3. Refresh conversations list
      const list = await whatsappService.getConversations();
      setConversations(list);
      if (list.length > 0) {
        setActiveConv(list[0]);
      }
    } catch (err) {
      console.error('Failed to start new WhatsApp chat:', err);
      alert(friendlyError(err, 'start chat'));
    } finally {
      setStartingChat(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c.contact?.name || c.contactName || c.contact?.phone || c.contactPhone || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.last_message_text || c.lastMessageText || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'unread' && ((c.unread_count || c.unreadCount) > 0)) ||
                          (statusFilter === 'open' && c.status !== 'closed');
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 48px)',
      margin: '-24px -32px',
      background: 'var(--surface)',
      overflow: 'hidden',
    }}>
      {/* LEFT PANE: Conversation List */}
      <div style={{
        width: 360,
        borderRight: '1px solid var(--outline-variant)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-container-lowest)',
        flexShrink: 0,
      }}>
        {/* Header & Search */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={18} color="var(--primary)" />
              WhatsApp Live Inbox
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                title="Start New Chat"
                className="btn btn-primary"
                style={{
                  padding: '5px 9px',
                  borderRadius: 6,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 600,
                }}
              >
                <Plus size={14} /> New
              </button>
              <button
                type="button"
                onClick={() => fetchConversations()}
                title="Refresh conversations"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--on-surface-variant)',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 6,
                }}
              >
                <RefreshCw size={15} className={loadingList ? 'spin' : ''} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--surface-container-low)',
            borderRadius: 8,
            padding: '7px 10px',
            gap: 8,
          }}>
            <Search size={15} color="var(--outline)" />
            <input
              type="text"
              placeholder="Search chats by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                width: '100%',
                color: 'var(--on-surface)',
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {['all', 'unread', 'open'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                style={{
                  border: statusFilter === f ? '1px solid rgba(211,31,38,0.3)' : '1px solid var(--outline-variant)',
                  background: statusFilter === f ? 'rgba(211,31,38,0.08)' : 'transparent',
                  color: statusFilter === f ? 'var(--primary)' : 'var(--on-surface-variant)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: statusFilter === f ? 600 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List Items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingList && conversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--outline)' }}>
              Loading chats…
            </div>
          ) : error ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--error)', fontSize: 13 }}>
              <AlertCircle size={22} style={{ margin: '0 auto 8px', display: 'block' }} />
              {error}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 13 }}>
              <MessageSquare size={28} style={{ margin: '0 auto 10px', opacity: 0.35, display: 'block' }} />
              No conversations found.
              <p style={{ margin: '6px 0 14px', fontSize: 12, color: 'var(--outline)' }}>
                Start a new conversation or wait for incoming messages.
              </p>
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                className="btn btn-primary"
                style={{ padding: '8px 14px', fontSize: 12.5, margin: '0 auto' }}
              >
                <Plus size={14} style={{ marginRight: 4 }} /> Start New Chat
              </button>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = activeConv?.id === c.id;
              const displayName = c.contact?.name || c.contactName || c.contact?.phone || c.contactPhone || 'WhatsApp User';
              const lastText = c.last_message_text || c.lastMessageText || 'No message yet';
              const lastTime = c.last_message_at || c.lastMessageAt;
              const unread = c.unread_count ?? c.unreadCount ?? 0;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConv(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--surface-container-high)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(211, 31, 38, 0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: isSelected ? 'var(--primary)' : 'var(--surface-container-high)',
                    color: isSelected ? '#fff' : 'var(--on-surface-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 15,
                    flexShrink: 0,
                  }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 600, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayName}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--outline)' }}>
                        {lastTime ? new Date(lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 12.5,
                        color: unread > 0 ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                        fontWeight: unread > 0 ? 600 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {lastText}
                      </span>

                      {unread > 0 && (
                        <span style={{
                          background: 'var(--primary)',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 999,
                          padding: '1px 6px',
                          marginLeft: 6,
                          flexShrink: 0,
                        }}>
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Active Chat Thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '14px 24px',
              borderBottom: '1px solid var(--outline-variant)',
              background: 'var(--surface-container-lowest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 650,
                  fontSize: 16,
                }}>
                  {(activeConv.contact?.name || activeConv.contactName || activeConv.contactPhone || 'W').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--on-surface)' }}>
                    {activeConv.contact?.name || activeConv.contactName || activeConv.contactPhone || 'WhatsApp Contact'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--on-surface-variant)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={12} /> {activeConv.contact?.phone || activeConv.contactPhone}
                    </span>
                    <span>•</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>WhatsApp</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'var(--surface-container-high)',
                  color: 'var(--on-surface-variant)',
                }}>
                  Status: {activeConv.status || 'Open'}
                </span>
              </div>
            </div>

            {/* Messages Feed */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: 'var(--surface-container-low)',
            }}>
              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--outline)' }}>
                  Loading messages…
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--on-surface-variant)' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>No messages in this conversation yet.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isOutbound = m.sender_type === 'agent' || m.senderType === 'agent' || m.direction === 'outbound';
                  const text = m.content_text || m.contentText || m.content || m.bodyText || '[Media Attachment]';
                  const msgDate = m.created_at || m.createdAt || new Date().toISOString();

                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isOutbound ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '10px 14px',
                        borderRadius: 14,
                        borderBottomRightRadius: isOutbound ? 2 : 14,
                        borderBottomLeftRadius: !isOutbound ? 2 : 14,
                        background: isOutbound ? 'var(--primary)' : 'var(--surface-container-lowest)',
                        color: isOutbound ? '#ffffff' : 'var(--on-surface)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        wordBreak: 'break-word',
                        fontSize: 13.5,
                        lineHeight: 1.5,
                      }}>
                        {text}

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 4,
                          marginTop: 4,
                          fontSize: 10.5,
                          opacity: isOutbound ? 0.85 : 0.6,
                        }}>
                          <span>{new Date(msgDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOutbound && (
                            m.status === 'failed' ? (
                              <span
                                title="Not delivered — WhatsApp only allows a plain text reply within 24 hours of the contact's last message to you. If they've never messaged you (or it's been over 24h), send an approved Template first to (re)open the conversation."
                                style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#fca5a5', cursor: 'help' }}
                              >
                                <AlertCircle size={12} /> Not delivered
                              </span>
                            ) : m.status === 'read' ? <CheckCheck size={13} color="#93c5fd" /> :
                            m.status === 'delivered' ? <CheckCheck size={13} /> :
                            <Check size={13} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Composer */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--outline-variant)',
                background: 'var(--surface-container-lowest)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <input
                type="text"
                placeholder="Type a WhatsApp reply (Press Enter to send)..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={sending}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 24,
                  border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container-low)',
                  color: 'var(--on-surface)',
                  fontSize: 13.5,
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                disabled={!messageText.trim() || sending}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: messageText.trim() && !sending ? 'var(--primary)' : 'var(--surface-container-high)',
                  color: messageText.trim() && !sending ? '#ffffff' : 'var(--outline)',
                  border: 'none',
                  cursor: messageText.trim() && !sending ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: 'var(--on-surface-variant)' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'var(--surface-container-high)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageSquare size={28} color="var(--primary)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: 'var(--on-surface)' }}>WhatsApp Live Inbox</h3>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--outline)' }}>
                Start a new conversation to message your personal WhatsApp number.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewChatModal(true)}
              className="btn btn-primary"
              style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Plus size={16} /> Start New Conversation
            </button>
          </div>
        )}
      </div>

      {/* Start New Conversation Modal */}
      {showNewChatModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16,
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 16,
            padding: '24px 28px',
            width: '100%',
            maxWidth: 460,
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--outline-variant)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={18} color="var(--primary)" /> Start WhatsApp Conversation
              </h2>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStartNewChat} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Contact Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer Name"
                  value={newChatForm.name}
                  onChange={(e) => setNewChatForm({ ...newChatForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Recipient Phone Number (with Country Code) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98000 00000"
                  value={newChatForm.phone}
                  onChange={(e) => setNewChatForm({ ...newChatForm, phone: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--outline)' }}>
                  Use the number you authorized under &quot;Recipient&quot; on Meta Developer Console.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Initial Message *
                </label>
                <textarea
                  rows={3}
                  placeholder="Hello! Welcome to Jayalakshmi Hyper Mart."
                  value={newChatForm.message}
                  onChange={(e) => setNewChatForm({ ...newChatForm, message: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={startingChat || !newChatForm.phone.trim() || !newChatForm.message.trim()}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Send size={14} /> {startingChat ? 'Sending to WhatsApp…' : 'Send WhatsApp Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
