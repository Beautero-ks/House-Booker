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

  useEffect(() => {
    if (!activeConv && conversations.length > 0) {
      setActiveConv(conversations[0]);
    }
  }, [activeConv, conversations]);

  const messages = useMemo(() => {
    if (!activeConv) return [];
    return [{
      id: activeConv.id,
      conversationId: activeConv.id,
      senderId: 'backend',
      text: activeConv.lastMessage,
      time: activeConv.time,
    }];
  }, [activeConv]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setMessage('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 h-[calc(100vh-200px)] flex overflow-hidden">
        
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 border-b bg-white">
            <h2 className="text-xl font-bold mb-4">{t('msg_conversations')}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t('msg_search_placeholder')} 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-primary focus:ring-0 text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading && <Loader />}
            {!loading && conversations.length === 0 && (
              <p className="p-4 text-sm text-gray-500">Aucune notification retournée par le backend.</p>
            )}
            {conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`flex items-start gap-3 p-4 border-b cursor-pointer transition-colors ${activeConv?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-primary' : 'hover:bg-gray-100 border-l-4 border-l-transparent'}`}
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
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{conv.userName}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{conv.time}</span>
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
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
            <div className="flex items-center gap-3">
              <img src={activeConv?.userImage} alt={activeConv?.userName} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="font-semibold text-gray-900">{activeConv?.userName || 'Backend'}</h3>
                <p className="text-xs text-green-500 font-medium">{t('msg_online')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <button className="hover:text-primary transition-colors"><Phone size={20} /></button>
              <button className="hover:text-primary transition-colors"><Video size={20} /></button>
              <button className="hover:text-primary transition-colors"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            <div className="text-center text-xs text-gray-400 mb-6">{t('msg_today')}</div>
            
            {messages.filter(m => m.conversationId === activeConv?.id).map(msg => {
              const isMe = msg.senderId === 'me';
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 mx-1">{msg.time}</span>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input 
                type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
                placeholder="Réponse locale désactivée tant que le backend messaging n’expose pas d’API"
                className="flex-1 py-3 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
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
