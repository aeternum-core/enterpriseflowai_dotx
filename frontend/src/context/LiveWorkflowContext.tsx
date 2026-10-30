import React, { createContext, useContext, useEffect, useState } from 'react';
import { Notification } from '../types';

interface LiveEventMessage {
  event: string;
  payload: any;
  timestamp: string;
}

interface LiveWorkflowContextType {
  isConnected: boolean;
  recentEvents: LiveEventMessage[];
  notifications: Notification[];
  unreadNotificationCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  activeToast: string | null;
  clearToast: () => void;
}

const LiveWorkflowContext = createContext<LiveWorkflowContextType | undefined>(undefined);

export const LiveWorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [recentEvents, setRecentEvents] = useState<LiveEventMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const refreshNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      // ignore
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      // ignore
    }
  };

  const clearToast = () => setActiveToast(null);

  useEffect(() => {
    refreshNotifications();

    const eventSource = new EventSource('/api/events/live');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventItem: LiveEventMessage = {
          event: data.event,
          payload: data.payload,
          timestamp: new Date().toLocaleTimeString()
        };

        setRecentEvents(prev => [eventItem, ...prev].slice(0, 50));

        // Format toast notification
        if (data.event === 'workflow_created') {
          setActiveToast(`🚀 Central Planner initialized plan: ${data.payload.title}`);
        } else if (data.event === 'task_completed') {
          setActiveToast(`✓ ${data.payload.task?.assignedAgentName} finished "${data.payload.task?.name}"`);
        } else if (data.event === 'approval_requested') {
          setActiveToast(`⚠️ Approval Required: ${data.payload.approval?.actionRequested}`);
          refreshNotifications();
        } else if (data.event === 'approval_decided') {
          setActiveToast(`Decision Recorded: ${data.payload.decision} on workflow`);
          refreshNotifications();
        } else if (data.event === 'workflow_completed') {
          setActiveToast(`🎉 Workflow Complete: ${data.payload.title}`);
          refreshNotifications();
        } else if (data.event === 'demo_failure_simulated') {
          setActiveToast(`⚠️ Fault Injected: Planner engaged self-healing protocol!`);
        }
      } catch (err) {
        console.error('Error parsing SSE event', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <LiveWorkflowContext.Provider
      value={{
        isConnected,
        recentEvents,
        notifications,
        unreadNotificationCount,
        refreshNotifications,
        markNotificationRead,
        activeToast,
        clearToast
      }}
    >
      {children}
    </LiveWorkflowContext.Provider>
  );
};

export const useLiveWorkflow = () => {
  const context = useContext(LiveWorkflowContext);
  if (!context) {
    throw new Error('useLiveWorkflow must be used within LiveWorkflowProvider');
  }
  return context;
};
