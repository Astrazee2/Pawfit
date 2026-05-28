import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import { Save, Lock, Bell, Eye } from 'lucide-react';

export function SettingsPage() {
  const [adminSettings, setAdminSettings] = useState({
    storeName: 'PawFit',
    storeEmail: 'admin@pawfit.com',
    storePhone: '+1 234 567 8900',
    currency: 'USD',
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    productAlerts: true,
    systemAlerts: true,
  });

  const [displaySettings, setDisplaySettings] = useState({
    theme: 'light',
    itemsPerPage: '20',
    dateFormat: 'MM/DD/YYYY',
  });

  const handleSaveAdminSettings = async () => {
    try {
      // API call would go here
      toast.success('Admin settings saved successfully');
    } catch (err) {
      toast.error('Failed to save admin settings');
    }
  };

  const handleSaveSecurity = async () => {
    try {
      // API call would go here
      toast.success('Security settings saved successfully');
    } catch (err) {
      toast.error('Failed to save security settings');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      // API call would go here
      toast.success('Notification preferences saved');
    } catch (err) {
      toast.error('Failed to save notification settings');
    }
  };

  const handleSaveDisplay = async () => {
    try {
      // API call would go here
      toast.success('Display settings saved successfully');
    } catch (err) {
      toast.error('Failed to save display settings');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
        Settings
      </h1>

      <div className="max-w-4xl space-y-6">
        {/* Admin Settings */}
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Admin Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={adminSettings.storeName}
                  onChange={(e) => setAdminSettings({ ...adminSettings, storeName: e.target.value })}
                  placeholder="PawFit"
                />
              </div>

              <div>
                <Label htmlFor="storeEmail">Store Email</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={adminSettings.storeEmail}
                  onChange={(e) => setAdminSettings({ ...adminSettings, storeEmail: e.target.value })}
                  placeholder="admin@pawfit.com"
                />
              </div>

              <div>
                <Label htmlFor="storePhone">Store Phone</Label>
                <Input
                  id="storePhone"
                  value={adminSettings.storePhone}
                  onChange={(e) => setAdminSettings({ ...adminSettings, storePhone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <Label htmlFor="currency">Default Currency</Label>
                <select
                  id="currency"
                  value={adminSettings.currency}
                  onChange={(e) => setAdminSettings({ ...adminSettings, currency: e.target.value })}
                  className="w-full p-2 border border-[#E8E4DF] rounded-lg"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="PHP">PHP (₱)</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSaveAdminSettings} className="bg-[#5C3D2E] hover:bg-[#4A3024] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Admin Settings
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-[#E8E4DF] rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-[#6B5D56]">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-[#E8E4DF] rounded-lg">
                <div>
                  <p className="font-medium">Login Notifications</p>
                  <p className="text-sm text-[#6B5D56]">Get notified of login attempts</p>
                </div>
                <Switch
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, loginNotifications: checked })
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveSecurity} className="bg-[#5C3D2E] hover:bg-[#4A3024] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-[#E8E4DF] rounded-lg">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-[#6B5D56]">Receive email notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-[#E8E4DF] rounded-lg">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-[#6B5D56]">Notify on order status changes</p>
                </div>
                <Switch
                  checked={notificationSettings.orderUpdates}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, orderUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-[#E8E4DF] rounded-lg">
                <div>
                  <p className="font-medium">Product Alerts</p>
                  <p className="text-sm text-[#6B5D56]">Get alerted on product updates</p>
                </div>
                <Switch
                  checked={notificationSettings.productAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, productAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-[#E8E4DF] rounded-lg">
                <div>
                  <p className="font-medium">System Alerts</p>
                  <p className="text-sm text-[#6B5D56]">Critical system notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, systemAlerts: checked })
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveNotifications} className="bg-[#5C3D2E] hover:bg-[#4A3024] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Notification Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={displaySettings.theme}
                  onChange={(e) => setDisplaySettings({ ...displaySettings, theme: e.target.value })}
                  className="w-full p-2 border border-[#E8E4DF] rounded-lg"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <Label htmlFor="itemsPerPage">Items Per Page</Label>
                <select
                  id="itemsPerPage"
                  value={displaySettings.itemsPerPage}
                  onChange={(e) => setDisplaySettings({ ...displaySettings, itemsPerPage: e.target.value })}
                  className="w-full p-2 border border-[#E8E4DF] rounded-lg"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <select
                  id="dateFormat"
                  value={displaySettings.dateFormat}
                  onChange={(e) => setDisplaySettings({ ...displaySettings, dateFormat: e.target.value })}
                  className="w-full p-2 border border-[#E8E4DF] rounded-lg"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSaveDisplay} className="bg-[#5C3D2E] hover:bg-[#4A3024] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Display Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
