import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, Bell, Package, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../ui/utils';
import {
  NotificationRecord,
  deleteNotificationApi,
  fetchNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from '../../services/api';

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-TN');
}

export function NotificationsPanel() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshAt, setLastRefreshAt] = useState('');
  const [loadError, setLoadError] = useState('');
  const failureCountRef = useRef(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof window.setTimeout> | null = null;

    const schedule = () => {
      if (!active) return;
      const visible = document.visibilityState === 'visible';
      const baseDelay = visible ? 15_000 : 60_000;
      const backoff = Math.min(120_000, failureCountRef.current * 15_000);
      timer = window.setTimeout(() => void load(false), baseDelay + backoff);
    };

    const load = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        const data = await fetchNotificationsApi();
        if (active) {
          setNotifications(data);
          setLoadError('');
          setLastRefreshAt(new Date().toLocaleTimeString('fr-TN'));
          failureCountRef.current = 0;
        }
      } catch (error) {
        if (active) {
          failureCountRef.current += 1;
          setLoadError(error instanceof Error ? error.message : 'Actualisation impossible');
        }
      } finally {
        if (active) setLoading(false);
        schedule();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (timer) window.clearTimeout(timer);
        void load(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    void load(true);
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
      case 'error':
        return <AlertCircle size={16} className={type === 'error' ? 'text-destructive' : 'text-warning'} />;
      case 'success':
        return <Package size={16} className="text-green-600" />;
      default:
        return <TrendingUp size={16} className="text-blue-600" />;
    }
  };

  const refresh = async () => {
    const data = await fetchNotificationsApi();
    setNotifications(data);
    setLoadError('');
    setLastRefreshAt(new Date().toLocaleTimeString('fr-TN'));
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((entry) => ({ ...entry, read: true })));
    try {
      await markAllNotificationsReadApi();
    } catch {
      await refresh();
    }
  };

  const handleMarkOneRead = async (id: string) => {
    setNotifications((prev) => prev.map((entry) => (entry.id === id ? { ...entry, read: true } : entry)));
    try {
      await markNotificationReadApi(id);
    } catch {
      await refresh();
    }
  };

  const handleOpenNotification = async (notification: NotificationRecord) => {
    await handleMarkOneRead(notification.id);
    if (notification.link) navigate(notification.link);
  };

  const handleDelete = async (event: MouseEvent, id: string) => {
    event.stopPropagation();
    setNotifications((prev) => prev.filter((entry) => entry.id !== id));
    try {
      await deleteNotificationApi(id);
    } catch {
      await refresh();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Ouvrir les notifications">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {loadError ? `Erreur: ${loadError}` : lastRefreshAt ? `Actualise a ${lastRefreshAt}` : 'Actualisation automatique'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => void handleMarkAllRead()}>
              Tout marquer lu
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          <div className="p-2">
            {loading ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">Aucune notification</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-md px-3 py-3 text-left hover:bg-accent',
                    !notification.read && 'bg-accent/50'
                  )}
                  onClick={() => void handleOpenNotification(notification)}
                >
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <span className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-medium',
                        notification.priority === 'high'
                          ? 'bg-destructive/10 text-destructive'
                          : notification.priority === 'low'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary/10 text-primary'
                      )}>
                        {notification.priority || 'medium'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatTime(notification.time)}</p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Supprimer la notification ${notification.title}`}
                    className="mt-1 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={(event) => void handleDelete(event, notification.id)}
                  >
                    <Trash2 size={14} />
                  </span>
                  {!notification.read && <div className="mt-2 h-2 w-2 rounded-full bg-blue-600" />}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
