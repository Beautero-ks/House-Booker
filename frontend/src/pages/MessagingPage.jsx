import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { getUserNotifications } from '../services/notificationApi';
import { Search, Phone, Video, MoreVertical, Send } from 'lucide-react';
import Loader from '../components/ui/Loader';

const MessagingPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const result = await getUserNotifications(user?.id);
        if (mounted) setNotifications(Array.isArray(result) ? result : []);
      } catch {
        if (mounted) setNotifications([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadNotifications();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const conversations = useMemo(() => {
    return notifications.map((notification) => ({
      id: notification.id,
      userName: notification.channel || notification.type || 'Notification',
      userImage: user?.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      houseTitle: notification.title || notification.subject || 'House Booker',
      lastMessage: notification.message || notification.content || notification.body || '',
      time: notification.createdAt || notification.sentAt || '',
      unread: notification.status === 'UNREAD' || notification.read === false ? 1 : 0,
    }));
  }, [notifications, user?.photoUrl]);

  const activeConversation = useMemo(() => {
    if (activeConv && conversations.some((conversation) => conversation.id === activeConv.id)) {
      return activeConv;
    }
    return conversations[0] || null;
  }, [activeConv, conversations]);

  const messages = useMemo(() => {
    if (!activeConversation) return [];
    return [{
      id: activeConversation.id,
      conversationId: activeConversation.id,
      senderId: 'backend',
      text: activeConversation.lastMessage,
      time: activeConversation.time,
    }];
  }, [activeConversation]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setMessage('');
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex h-[calc(100dvh-96px)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card md:h-[calc(100vh-200px)] md:min-h-[620px] md:flex-row md:rounded-2xl">
        
        {/* Conversations List */}
        <div className="flex h-56 shrink-0 flex-col border-b border-gray-200 bg-gray-50 sm:h-64 md:h-auto md:w-1/3 md:border-b-0 md:border-r">
          <div className="border-b bg-white p-3 sm:p-4">
            <h2 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">{t('msg_conversations')}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t('msg_search_placeholder')} 
                className="min-h-11 w-full rounded-lg border-transparent bg-gray-100 py-2 pl-10 pr-4 text-base focus:border-primary focus:bg-white focus:ring-0"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading && <Loader />}
            {!loading && conversations.length === 0 && (
              <p className="p-4 text-sm text-gray-500">{t('msg_no_notifications')}</p>
            )}
            {conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`flex min-h-20 cursor-pointer items-start gap-3 border-b p-3 transition-colors sm:p-4 ${activeConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-primary' : 'hover:bg-gray-100 border-l-4 border-l-transparent'}`}
              >
                <div className="relative">
                  <img src={conv.userImage} alt={conv.userName} className="w-12 h-12 rounded-full object-cover" />
                  {conv.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-gray-900 truncate">{conv.userName}</h4>
                    <span className="max-w-24 truncate text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <p className="text-xs text-primary font-medium mb-1 truncate">{conv.houseTitle}</p>
                  <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
          <div className="min-h-0 flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="z-10 flex items-center justify-between gap-3 border-b bg-white p-3 shadow-sm sm:p-4">
            <div className="flex min-w-0 items-center gap-3">
              <img src={activeConversation?.userImage} alt={activeConversation?.userName} className="w-10 h-10 rounded-full object-cover" />
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-gray-900">{activeConversation?.userName || 'Backend'}</h3>
                <p className="text-xs text-green-500 font-medium">{t('msg_online')}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-gray-500 sm:gap-2">
              <button type="button" className="flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors hover:bg-gray-50 hover:text-primary"><Phone size={20} /></button>
              <button type="button" className="flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors hover:bg-gray-50 hover:text-primary"><Video size={20} /></button>
              <button type="button" className="flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors hover:bg-gray-50 hover:text-primary"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:space-y-6 sm:p-6">
            <div className="text-center text-xs text-gray-400 mb-6">{t('msg_today')}</div>
            
            {messages.filter(m => m.conversationId === activeConversation?.id).map(msg => {
              const isMe = msg.senderId === 'me';
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl p-3 sm:max-w-[70%] ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 mx-1">{msg.time}</span>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-3 sm:p-4">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input 
                type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
                placeholder={t('msg_reply_disabled')}
                className="min-h-11 min-w-0 flex-1 rounded-full bg-gray-100 px-4 py-3 text-base transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                disabled
              />
              <button 
                type="submit" 
                disabled={!message.trim()}
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
