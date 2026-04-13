/**
 * Admin Settings Page
 * Comprehensive settings with multiple sections
 */

import { useState } from 'react';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { toast } from 'sonner';
import {
  Settings,
  Mail,
  Building2,
  Users,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const settingsSections = [
  { id: 'general', label: 'General Settings', icon: Settings },
  { id: 'email', label: 'Email Configuration', icon: Mail },
  { id: 'property', label: 'Property Settings', icon: Building2 },
  { id: 'users', label: 'User & Roles', icon: Users },
  { id: 'payment', label: 'Payment Gateway', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'PrimeX',
    tagline: 'Premium Real Estate Platform',
    primaryEmail: 'contact@primex.com',
    supportPhone: '+1 234 567 8900',
    address: '123 Business District, New York, NY 10001',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    newUserRegistration: true,
    newPropertyListing: true,
    propertyApproved: true,
    meetingRequest: true,
    dailySummary: false,
    weeklyReport: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    activityLogging: true,
    autoBackup: true,
    backupFrequency: 'daily',
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Platform Name</Label>
                <Input
                  value={generalSettings.platformName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  value={generalSettings.tagline}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, tagline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Email</Label>
                <Input
                  type="email"
                  value={generalSettings.primaryEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, primaryEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Support Phone</Label>
                <Input
                  value={generalSettings.supportPhone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Office Address</Label>
                <Textarea
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={generalSettings.timezone} onValueChange={(v) => setGeneralSettings({ ...generalSettings, timezone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={generalSettings.currency} onValueChange={(v) => setGeneralSettings({ ...generalSettings, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="PKR">PKR (₨)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Notification Channels</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailEnabled', label: 'Email Notifications' },
                  { key: 'smsEnabled', label: 'SMS Notifications' },
                  { key: 'pushEnabled', label: 'Push Notifications' },
                  { key: 'inAppEnabled', label: 'In-App Notifications' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">{item.label}</span>
                    <Switch
                      checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, [item.key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Notification Events</h3>
              <div className="space-y-4">
                {[
                  { key: 'newUserRegistration', label: 'New user registration' },
                  { key: 'newPropertyListing', label: 'New property listing' },
                  { key: 'propertyApproved', label: 'Property approved/rejected' },
                  { key: 'meetingRequest', label: 'Meeting request received' },
                  { key: 'dailySummary', label: 'Daily summary email' },
                  { key: 'weeklyReport', label: 'Weekly report' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">{item.label}</span>
                    <Switch
                      checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, [item.key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Authentication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin users</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Password Length</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Backup & Logging</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Activity Logging</p>
                    <p className="text-sm text-muted-foreground">Log all admin activities</p>
                  </div>
                  <Switch
                    checked={securitySettings.activityLogging}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, activityLogging: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Auto Backup</p>
                    <p className="text-sm text-muted-foreground">Automatically backup database</p>
                  </div>
                  <Switch
                    checked={securitySettings.autoBackup}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, autoBackup: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12 text-muted-foreground">
            <p>Settings for {activeSection} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout title="Settings" navItems={adminNavItems}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-card rounded-xl border border-border p-2">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {settingsSections.find((s) => s.id === activeSection)?.label}
              </h2>
            </div>
            <div className="p-6">{renderContent()}</div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
