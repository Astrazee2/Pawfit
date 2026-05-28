import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Bell, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  read: boolean;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Order Received',
      message: 'Order #12345 has been placed by John Doe for $89.99',
      type: 'success',
      timestamp: '2 minutes ago',
      read: false,
    },
    {
      id: '2',
      title: 'Low Stock Alert',
      message: 'Premium Dog Shirt (Size M) is running low. Only 3 items in stock.',
      type: 'warning',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      title: 'Payment Failed',
      message: 'Payment for order #12340 failed. Customer needs to retry payment.',
      type: 'error',
      timestamp: '3 hours ago',
      read: true,
    },
    {
      id: '4',
      title: 'System Maintenance',
      message: 'Scheduled maintenance window: May 28 from 2:00 AM - 4:00 AM UTC',
      type: 'info',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: '5',
      title: 'Product Update',
      message: 'Winter Coat Model has been updated with new GLB asset',
      type: 'success',
      timestamp: '2 days ago',
      read: true,
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Badge className="bg-[#C4714A] text-white text-lg px-3 py-1">
              {unreadCount}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="border-[#E8E4DF]"
            >
              Mark All as Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-[#C4714A]" />
            <p className="text-[#6B5D56]">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-0 shadow-sm rounded-2xl cursor-pointer transition-colors hover:shadow-md ${
                notification.read ? '' : 'border-2 border-[#C4714A]'
              }`}
            >
              <CardContent className={`p-6 ${getNotificationColor(notification.type)}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-[#5C3D2E] mb-1 ${
                            notification.read ? '' : 'font-bold'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-[#6B5D56] mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[#8B7B74]">
                          {notification.timestamp}
                        </p>
                      </div>

                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-[#C4714A] rounded-full mt-2"></div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-sm px-3 py-1 bg-white/50 hover:bg-white text-[#5C3D2E] rounded-lg transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-sm px-3 py-1 bg-white/50 hover:bg-white text-red-600 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notification Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#8B4A4A] mb-2">Total Notifications</p>
                <p className="text-3xl font-bold text-[#5C3D2E]">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-[#C4714A]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#4A6B8B] mb-2">Unread</p>
                <p className="text-3xl font-bold text-[#5C3D2E]">{unreadCount}</p>
              </div>
              <Badge className="bg-[#C4714A] text-white">{Math.round((unreadCount / notifications.length) * 100) || 0}%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#4A8B4A] mb-2">Success</p>
                <p className="text-3xl font-bold text-[#5C3D2E]">
                  {notifications.filter(n => n.type === 'success').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#8B6B4A] mb-2">Alerts</p>
                <p className="text-3xl font-bold text-[#5C3D2E]">
                  {notifications.filter(n => n.type === 'warning' || n.type === 'error').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
