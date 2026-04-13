/**
 * Platform Analytics Page
 * Comprehensive analytics dashboard with charts and metrics
 */

import { useState } from 'react';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Target,
  RefreshCw,
  Download,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Sample data for charts
const userGrowthData = [
  { month: 'Jan', admin: 2, buyer: 45, investor: 12, developer: 8 },
  { month: 'Feb', admin: 2, buyer: 52, investor: 15, developer: 10 },
  { month: 'Mar', admin: 3, buyer: 68, investor: 18, developer: 14 },
  { month: 'Apr', admin: 3, buyer: 82, investor: 22, developer: 16 },
  { month: 'May', admin: 4, buyer: 95, investor: 28, developer: 20 },
  { month: 'Jun', admin: 4, buyer: 110, investor: 32, developer: 24 },
  { month: 'Jul', admin: 5, buyer: 128, investor: 38, developer: 28 },
  { month: 'Aug', admin: 5, buyer: 145, investor: 42, developer: 32 },
  { month: 'Sep', admin: 5, buyer: 162, investor: 48, developer: 36 },
  { month: 'Oct', admin: 6, buyer: 180, investor: 52, developer: 40 },
  { month: 'Nov', admin: 6, buyer: 195, investor: 58, developer: 45 },
  { month: 'Dec', admin: 6, buyer: 210, investor: 65, developer: 50 },
];

const propertyListingsData = [
  { month: 'Jul', approved: 24, pending: 8, rejected: 3 },
  { month: 'Aug', approved: 32, pending: 12, rejected: 5 },
  { month: 'Sep', approved: 28, pending: 15, rejected: 4 },
  { month: 'Oct', approved: 38, pending: 10, rejected: 6 },
  { month: 'Nov', approved: 45, pending: 18, rejected: 8 },
  { month: 'Dec', approved: 52, pending: 14, rejected: 5 },
];

const revenueData = [
  { month: 'Jan', commission: 12000, subscription: 5000 },
  { month: 'Feb', commission: 15000, subscription: 5500 },
  { month: 'Mar', commission: 18000, subscription: 6000 },
  { month: 'Apr', commission: 22000, subscription: 6500 },
  { month: 'May', commission: 28000, subscription: 7000 },
  { month: 'Jun', commission: 32000, subscription: 7500 },
  { month: 'Jul', commission: 38000, subscription: 8000 },
  { month: 'Aug', commission: 42000, subscription: 8500 },
  { month: 'Sep', commission: 48000, subscription: 9000 },
  { month: 'Oct', commission: 55000, subscription: 9500 },
  { month: 'Nov', commission: 62000, subscription: 10000 },
  { month: 'Dec', commission: 68000, subscription: 10500 },
];

const userDistributionData = [
  { name: 'Buyers', value: 210, color: '#f59e0b' },
  { name: 'Investors', value: 65, color: '#22c55e' },
  { name: 'Developers', value: 50, color: '#3b82f6' },
  { name: 'Admins', value: 6, color: '#a855f7' },
];

const propertyTypeData = [
  { name: 'Residential', value: 45, color: '#22c55e' },
  { name: 'Commercial', value: 25, color: '#0ea5e9' },
  { name: 'Luxury', value: 18, color: '#f59e0b' },
  { name: 'Land/Plot', value: 12, color: '#8b5cf6' },
];

const topPropertiesData = [
  { rank: 1, title: 'Marina Bay Residences', views: 1250, inquiries: 45, owner: 'Sarah Chen' },
  { rank: 2, title: 'Crystal Tower Penthouse', views: 1180, inquiries: 38, owner: 'James Williams' },
  { rank: 3, title: 'Tech Park Offices', views: 980, inquiries: 32, owner: 'Ahmed Al-Rashid' },
  { rank: 4, title: 'Oak Park Apartments', views: 850, inquiries: 28, owner: 'Emma Thompson' },
  { rank: 5, title: 'Sunset Heights', views: 720, inquiries: 24, owner: 'Michael Johnson' },
];

const activeUsersData = [
  { rank: 1, name: 'Khurrum Ghori', role: 'buyer', propertiesViewed: 45, inquiries: 12, lastActive: '2 hours ago' },
  { rank: 2, name: 'Sarah Chen', role: 'developer', propertiesViewed: 38, inquiries: 28, lastActive: '3 hours ago' },
  { rank: 3, name: 'James Williams', role: 'investor', propertiesViewed: 32, inquiries: 8, lastActive: '5 hours ago' },
  { rank: 4, name: 'Emma Thompson', role: 'buyer', propertiesViewed: 28, inquiries: 6, lastActive: '1 day ago' },
  { rank: 5, name: 'Ahmed Al-Rashid', role: 'developer', propertiesViewed: 24, inquiries: 15, lastActive: '1 day ago' },
];

const recentTransactions = [
  { date: '2024-01-20', property: 'Marina Bay Unit 4A', buyer: 'John Smith', amount: 850000, commission: 25500, status: 'completed' },
  { date: '2024-01-18', property: 'Crystal Tower P2', buyer: 'Sarah Johnson', amount: 3500000, commission: 105000, status: 'pending' },
  { date: '2024-01-15', property: 'Tech Park Suite 102', buyer: 'Tech Corp Ltd', amount: 5000000, commission: 150000, status: 'completed' },
  { date: '2024-01-12', property: 'Oak Park Apt 3B', buyer: 'Michael Brown', amount: 720000, commission: 21600, status: 'completed' },
  { date: '2024-01-10', property: 'Sunset Heights Villa', buyer: 'Emily Davis', amount: 1200000, commission: 36000, status: 'pending' },
];

const PlatformAnalytics = () => {
  const [dateRange, setDateRange] = useState('year');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <DashboardLayout title="Platform Analytics" navItems={adminNavItems}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +12.5%
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(78500)}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +8.3%
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">331</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +15.2%
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">156</p>
          <p className="text-sm text-muted-foreground">Total Properties</p>
          <p className="text-xs text-muted-foreground mt-1">142 active • 14 pending</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
              <TrendingDown className="w-4 h-4" />
              -2.1%
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">4.2%</p>
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
          <p className="text-xs text-muted-foreground mt-1">Target: 5%</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="buyer" stroke="#f59e0b" strokeWidth={2} name="Buyers" />
              <Line type="monotone" dataKey="investor" stroke="#22c55e" strokeWidth={2} name="Investors" />
              <Line type="monotone" dataKey="developer" stroke="#3b82f6" strokeWidth={2} name="Developers" />
              <Line type="monotone" dataKey="admin" stroke="#a855f7" strokeWidth={2} name="Admins" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Properties Listed Chart */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Properties Listed</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propertyListingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="approved" fill="#22c55e" name="Approved" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-card rounded-xl p-6 border border-border lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend />
              <Area type="monotone" dataKey="commission" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Commission" />
              <Area type="monotone" dataKey="subscription" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Subscription" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-foreground">331</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {userDistributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Properties */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Top 5 Most Viewed Properties</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Property</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Inquiries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPropertiesData.map((property) => (
                <TableRow key={property.rank}>
                  <TableCell className="font-medium">{property.rank}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{property.title}</p>
                      <p className="text-xs text-muted-foreground">{property.owner}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      {property.views.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <MessageSquare className="w-3 h-3 text-muted-foreground" />
                      {property.inquiries}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Most Active Users */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Most Active Users</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeUsersData.map((user) => (
                <TableRow key={user.rank}>
                  <TableCell className="font-medium">{user.rank}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <span className="text-xs capitalize text-muted-foreground">{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{user.propertiesViewed}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {user.lastActive}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                  <TableCell className="font-medium text-foreground">{tx.property}</TableCell>
                  <TableCell>{tx.buyer}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(tx.amount)}</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(tx.commission)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlatformAnalytics;
