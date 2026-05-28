import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Mail, Trash2, Archive, Reply, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  from: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  category: 'inquiry' | 'complaint' | 'feedback' | 'support';
}

export function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'John Doe',
      email: 'john@example.com',
      subject: 'Product Quality Inquiry',
      message: 'I would like to know more about the materials used in your products.',
      date: '2026-05-25',
      read: false,
      category: 'inquiry',
    },
    {
      id: '2',
      from: 'Sarah Smith',
      email: 'sarah@example.com',
      subject: 'Order Issue',
      message: 'I received the wrong size in my order. How can we resolve this?',
      date: '2026-05-24',
      read: true,
      category: 'complaint',
    },
    {
      id: '3',
      from: 'Mike Johnson',
      email: 'mike@example.com',
      subject: 'Great Service!',
      message: 'I wanted to express my satisfaction with your service and products.',
      date: '2026-05-23',
      read: true,
      category: 'feedback',
    },
  ]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | Message['category']>('all');

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.from.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === 'all' || msg.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = (id: string) => {
    setMessages(messages.map(msg =>
      msg.id === id ? { ...msg, read: true } : msg
    ));
    toast.success('Message marked as read');
  };

  const handleDelete = (id: string) => {
    setMessages(messages.filter(msg => msg.id !== id));
    setSelectedMessage(null);
    toast.success('Message deleted');
  };

  const handleArchive = (id: string) => {
    setMessages(messages.filter(msg => msg.id !== id));
    setSelectedMessage(null);
    toast.success('Message archived');
  };

  const handleReply = () => {
    if (selectedMessage) {
      toast.success('Reply sent to ' + selectedMessage.from);
    }
  };

  const getCategoryColor = (category: Message['category']) => {
    switch (category) {
      case 'inquiry':
        return 'bg-blue-100 text-blue-700';
      case 'complaint':
        return 'bg-red-100 text-red-700';
      case 'feedback':
        return 'bg-green-100 text-green-700';
      case 'support':
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
        Inbox
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm rounded-3xl">
            <CardContent className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B5D56]" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filterCategory === 'all'
                      ? 'bg-[#5C3D2E] text-white'
                      : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  All Messages
                </button>
                <button
                  onClick={() => setFilterCategory('inquiry')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filterCategory === 'inquiry'
                      ? 'bg-[#5C3D2E] text-white'
                      : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  Inquiries
                </button>
                <button
                  onClick={() => setFilterCategory('complaint')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filterCategory === 'complaint'
                      ? 'bg-[#5C3D2E] text-white'
                      : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  Complaints
                </button>
                <button
                  onClick={() => setFilterCategory('feedback')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filterCategory === 'feedback'
                      ? 'bg-[#5C3D2E] text-white'
                      : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  Feedback
                </button>
                <button
                  onClick={() => setFilterCategory('support')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filterCategory === 'support'
                      ? 'bg-[#5C3D2E] text-white'
                      : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  Support
                </button>
              </div>

              <div className="mt-4 p-3 bg-[#FAF7F2] rounded-lg text-sm">
                <p className="text-[#6B5D56]">
                  Unread: <span className="font-bold">{messages.filter(m => !m.read).length}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="border-0 shadow-sm rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C4714A] rounded-full flex items-center justify-center text-white font-bold">
                      {selectedMessage.from.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{selectedMessage.from}</p>
                      <p className="text-sm text-[#6B5D56]">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(selectedMessage.category)}>
                    {selectedMessage.category}
                  </Badge>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#5C3D2E] mb-2">{selectedMessage.subject}</h2>
                  <p className="text-sm text-[#6B5D56]">{selectedMessage.date}</p>
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-lg mb-6">
                  <p className="text-[#5C3D2E]">{selectedMessage.message}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleReply}
                    className="flex items-center gap-2 px-4 py-2 bg-[#5C3D2E] hover:bg-[#4A3024] text-white rounded-xl"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                  <button
                    onClick={() => handleArchive(selectedMessage.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DF] text-[#6B5D56] hover:bg-[#FAF7F2] rounded-xl"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm rounded-3xl">
              <CardContent className="p-12 text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 text-[#C4714A]" />
                <p className="text-[#6B5D56]">Select a message to read</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {filteredMessages.map((message) => (
                    <tr
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        handleMarkAsRead(message.id);
                      }}
                      className={`cursor-pointer hover:bg-[#FAF7F2] transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-[#FAF7F2]' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium">{message.from}</p>
                          <p className="text-sm text-[#6B5D56]">{message.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={message.read ? 'text-[#6B5D56]' : 'font-semibold text-[#5C3D2E]'}>
                          {message.subject}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getCategoryColor(message.category)}>
                          {message.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B5D56]">
                        {message.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {message.read ? (
                          <span className="text-sm text-[#6B5D56]">Read</span>
                        ) : (
                          <span className="text-sm font-medium text-blue-600">Unread</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
