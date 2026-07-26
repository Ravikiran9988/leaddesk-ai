import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('lead_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lead_notifications', JSON.stringify(notifications.slice(0, 50)));
    } catch (err) {
      console.warn('Failed to save notifications to localStorage', err);
    }
  }, [notifications]);

  useEffect(() => {
    if (!socket) return;

    const handleLeadCreated = (lead) => {
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'New Lead',
        title: '🌟 New Lead Submitted',
        message: `${lead.name} (${lead.email}) submitted an inquiry from ${lead.source || 'Website'}.`,
        lead,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      toast.success(`New Lead: ${lead.name}`, { duration: 4000 });
    };

    const handleLeadUpdated = (data) => {
      if (data.type === 'status_changed') {
        const newNotif = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'Status Changed',
          title: '🔄 Lead Status Updated',
          message: `${data.lead.name}'s status changed to "${data.newStatus}".`,
          lead: data.lead,
          createdAt: new Date().toISOString(),
          read: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);
        toast.info(`Status updated for ${data.lead.name}`, { duration: 3500 });
      }
    };

    const handleLeadAssigned = (data) => {
      const assigneeName = data.assignedTo?.name || 'a team member';
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'Assignment',
        title: '👤 Lead Assigned',
        message: `${data.lead.name} was assigned to ${assigneeName}.`,
        lead: data.lead,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      toast.success(`Assigned ${data.lead.name} to ${assigneeName}`, { duration: 4000 });
    };

    const handleAiAnalyzed = (data) => {
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'AI Analysis Complete',
        title: '🤖 AI Analysis Complete',
        message: `Analyzed ${data.lead.name} — Priority: ${data.analysis.priority}, Score: ${data.analysis.leadScore}`,
        lead: data.lead,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      toast(`AI Analysis complete for ${data.lead.name}`, { icon: '🤖', duration: 4000 });
    };

    socket.on('lead:created', handleLeadCreated);
    socket.on('lead:updated', handleLeadUpdated);
    socket.on('lead:assigned', handleLeadAssigned);
    socket.on('ai:analyzed', handleAiAnalyzed);

    return () => {
      socket.off('lead:created', handleLeadCreated);
      socket.off('lead:updated', handleLeadUpdated);
      socket.off('lead:assigned', handleLeadAssigned);
      socket.off('ai:analyzed', handleAiAnalyzed);
    };
  }, [socket]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
