/**
 * Broker Dashboard
 * Dashboard for brokers/agents to manage listings, leads, and appointments
 */

import { useState } from 'react';
import DashboardLayout, { brokerNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Calendar, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const BrokerDashboard = () => {
  // Mock data - would come from database
  const stats = {
    activeListings: 8,
    pendingApproval: 2,
    assignedLeads: 15,
    upcomingAppointments: 5,
    conversions: 3,
    conversionRate: 20,
  };

  const recentLeads = [
    { id: '1', name: 'Rahul Sharma', property: 'Marina Bay Residences', type: 'viewing', status: 'new', date: '2 hours ago' },
    { id: '2', name: 'Priya Patel', property: 'Sunset Heights', type: 'inquiry', status: 'contacted', date: '1 day ago' },
    { id: '3', name: 'Amit Kumar', property: 'Oak Park Apartments', type: 'callback', status: 'qualified', date: '2 days ago' },
  ];

  const upcomingAppointments = [
    { id: '1', client: 'Vikram Singh', property: 'Crystal Tower', time: 'Today, 3:00 PM', type: 'Site Visit' },
    { id: '2', client: 'Neha Gupta', property: 'Green Valley Villas', time: 'Tomorrow, 11:00 AM', type: 'Virtual Tour' },
  ];

  return (
    <DashboardLayout title="Broker Dashboard" navItems={brokerNavItems}>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.activeListings}</p>
              <p className="text-xs text-muted-foreground">Active Listings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.pendingApproval}</p>
              <p className="text-xs text-muted-foreground">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.assignedLeads}</p>
              <p className="text-xs text-muted-foreground">Assigned Leads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.upcomingAppointments}</p>
              <p className="text-xs text-muted-foreground">Appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.conversions}</p>
              <p className="text-xs text-muted-foreground">Conversions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Conv. Rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Leads</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.property}</p>
                      <p className="text-xs text-muted-foreground">{lead.date}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={lead.status === 'new' ? 'default' : 'secondary'} className="capitalize">
                        {lead.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{lead.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{apt.client}</p>
                      <p className="text-sm text-muted-foreground">{apt.property}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{apt.time}</p>
                      <Badge variant="outline" className="text-xs">{apt.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <span className="text-sm">2 listings awaiting admin approval</span>
                <Button size="sm" variant="outline">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <span className="text-sm">5 leads need follow-up today</span>
                <Button size="sm" variant="outline">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                <span className="text-sm">Complete profile verification</span>
                <Button size="sm" variant="outline">Complete</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BrokerDashboard;
