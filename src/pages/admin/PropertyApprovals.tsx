/**
 * Property Approvals Page
 * Admin page for managing property approval workflow
 */

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout, { adminNavItems } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  Eye,
  Check,
  X,
  MoreHorizontal,
  Building2,
  MapPin,
  Calendar,
  ChevronRight,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { UserRoleBadge } from '@/components/admin/UserRoleBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { SAMPLE_PROPERTIES, Property } from '@/data/propertyData';

type TabValue = 'pending' | 'approved' | 'rejected' | 'all';
type ViewMode = 'table' | 'cards';

interface PropertyWithApproval extends Property {
  approval_status: 'pending' | 'approved' | 'rejected';
  submitted_date: string;
  listed_by: {
    name: string;
    role: string;
  };
}

const PropertyApprovals = () => {
  const [properties, setProperties] = useState<PropertyWithApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState<TabValue>('pending');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  // Detail panel & modal states
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithApproval | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    // Simulate loading with sample data + approval status
    const propsWithApproval: PropertyWithApproval[] = SAMPLE_PROPERTIES.map((p, idx) => ({
      ...p,
      approval_status: idx % 3 === 0 ? 'pending' : idx % 3 === 1 ? 'approved' : 'rejected',
      submitted_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      listed_by: {
        name: p.agent.name,
        role: 'developer',
      },
    }));
    setProperties(propsWithApproval);
    setLoading(false);
  };

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter((p) => p.approval_status === activeTab);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.listed_by.name.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((p) => p.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.approval_status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'price-high':
        result.sort((a, b) => parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, '')));
        break;
      case 'price-low':
        result.sort((a, b) => parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, '')));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.submitted_date).getTime() - new Date(b.submitted_date).getTime());
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.submitted_date).getTime() - new Date(a.submitted_date).getTime());
        break;
    }

    return result;
  }, [properties, searchQuery, typeFilter, statusFilter, sortBy, activeTab]);

  const handleApprove = async (property: PropertyWithApproval) => {
    setActionLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500));
    setProperties(
      properties.map((p) =>
        p.id === property.id ? { ...p, approval_status: 'approved' as const } : p
      )
    );
    toast.success(`${property.title} has been approved`);
    setActionLoading(false);
    setDetailsOpen(false);
  };

  const handleReject = async () => {
    if (!selectedProperty || !rejectionReason.trim()) return;
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setProperties(
      properties.map((p) =>
        p.id === selectedProperty.id ? { ...p, approval_status: 'rejected' as const } : p
      )
    );
    toast.success(`${selectedProperty.title} has been rejected`);
    setActionLoading(false);
    setRejectModalOpen(false);
    setRejectionReason('');
    setDetailsOpen(false);
  };

  const handleBulkApprove = async () => {
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setProperties(
      properties.map((p) =>
        selectedProperties.includes(p.id) ? { ...p, approval_status: 'approved' as const } : p
      )
    );
    toast.success(`${selectedProperties.length} properties approved`);
    setSelectedProperties([]);
    setActionLoading(false);
  };

  const openDetails = (property: PropertyWithApproval) => {
    setSelectedProperty(property);
    setDetailsOpen(true);
  };

  const openRejectModal = (property: PropertyWithApproval) => {
    setSelectedProperty(property);
    setRejectModalOpen(true);
  };

  const stats = {
    pending: properties.filter((p) => p.approval_status === 'pending').length,
    approved: properties.filter((p) => p.approval_status === 'approved').length,
    rejected: properties.filter((p) => p.approval_status === 'rejected').length,
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'residential':
        return 'residential-badge';
      case 'commercial':
        return 'commercial-badge';
      case 'luxury':
        return 'luxury-badge';
      case 'construction':
        return 'construction-badge';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout title="Property Approvals" navItems={adminNavItems}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-xl border border-border">
        {/* Tabs */}
        <div className="border-b border-border px-4 pt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                Pending
                {stats.pending > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                    {stats.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                Rejected
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
              >
                All Properties
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, address, or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-high">Price High-Low</SelectItem>
                  <SelectItem value="price-low">Price Low-High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {selectedProperties.length > 0 && activeTab === 'pending' && (
                <Button onClick={handleBulkApprove} disabled={actionLoading}>
                  <Check className="w-4 h-4 mr-2" />
                  Approve ({selectedProperties.length})
                </Button>
              )}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode('table')}
                >
                  <LayoutList className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode('cards')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : filteredProperties.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No properties found"
              description="No properties match your current filters"
            />
          ) : viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProperties.length === filteredProperties.filter((p) => p.approval_status === 'pending').length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProperties(
                            filteredProperties
                              .filter((p) => p.approval_status === 'pending')
                              .map((p) => p.id)
                          );
                        } else {
                          setSelectedProperties([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Listed By</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProperties.includes(property.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProperties([...selectedProperties, property.id]);
                          } else {
                            setSelectedProperties(selectedProperties.filter((id) => id !== property.id));
                          }
                        }}
                        disabled={property.approval_status !== 'pending'}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={property.imageUrl}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{property.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{property.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`project-badge text-xs ${getTypeBadgeClass(property.type)}`}>
                        {property.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{property.listed_by.name}</span>
                        <UserRoleBadge role={property.listed_by.role} size="sm" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{property.price}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(property.submitted_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={property.approval_status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetails(property)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {property.approval_status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleApprove(property)} className="text-green-600">
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openRejectModal(property)} className="text-red-600">
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openDetails(property)}
                >
                  <div className="relative h-40">
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`project-badge text-xs ${getTypeBadgeClass(property.type)}`}>
                        {property.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={property.approval_status} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{property.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{property.address}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{property.price}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(property.submitted_date), 'MMM dd')}
                      </span>
                    </div>
                    {property.approval_status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(property);
                          }}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRejectModal(property);
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Side Panel */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedProperty && (
            <>
              <SheetHeader>
                <SheetTitle>Property Details</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Image Gallery */}
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <img
                    src={selectedProperty.imageUrl}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {selectedProperty.gallery.length} photos
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-foreground">{selectedProperty.title}</h3>
                    <StatusBadge status={selectedProperty.approval_status} />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedProperty.address}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{selectedProperty.price}</p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{selectedProperty.bedrooms}</p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{selectedProperty.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{selectedProperty.area}</p>
                    <p className="text-xs text-muted-foreground">Area</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedProperty.description}</p>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Listed By */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Listed By</h4>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {selectedProperty.listed_by.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedProperty.listed_by.name}</p>
                      <UserRoleBadge role={selectedProperty.listed_by.role} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Submission Info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted on {format(new Date(selectedProperty.submitted_date), 'MMM dd, yyyy')}</span>
                </div>

                {/* Actions */}
                {selectedProperty.approval_status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button className="flex-1" onClick={() => handleApprove(selectedProperty)} disabled={actionLoading}>
                      <Check className="w-4 h-4 mr-2" />
                      Approve Property
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => openRejectModal(selectedProperty)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting <strong>{selectedProperty?.title}</strong>
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PropertyApprovals;
