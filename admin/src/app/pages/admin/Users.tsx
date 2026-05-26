import { useState, useEffect, useCallback } from "react"
import {
  Search, Shield, User, Building2, Ban, Eye, RefreshCw,
  CheckCircle, Loader2, ChevronLeft, ChevronRight
} from "lucide-react"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/Tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/Dialog"

const API_URL = 'http://localhost:5000/api/admin';

function getHeaders() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

interface UserItem {
  id: number;
  username: string;
  display_name: string | null;
  email: string;
  role: 'candidate' | 'employer';
  is_active: number;
  is_verified: number;
  created_at: string;
  company_id: number | null;
  company_name: string | null;
  company_verified: number | null;
}

interface Stats {
  total: number;
  total_candidates: number;
  total_employers: number;
  total_banned: number;
  total_pending: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function Users() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, total_candidates: 0, total_employers: 0, total_banned: 0, total_pending: 0 });
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ban modal
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banLoading, setBanLoading] = useState(false);

  // Verify modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (filter !== 'all') {
        if (filter === 'employers') params.append('role', 'employer');
        else if (filter === 'candidates') params.append('role', 'candidate');
        else if (filter === 'banned') params.append('status', 'banned');
        else if (filter === 'pending') params.append('status', 'pending');
      }
      if (search) params.append('search', search);

      const res = await fetch(`${API_URL}/users?${params}`, { headers: getHeaders() });
      const data = await res.json();

      if (data.success) {
        setUsers(data.data);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Lỗi khi tải dữ liệu');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleBan = async () => {
    if (!selectedUser) return;
    setBanLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${selectedUser.id}/toggle-ban`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ reason: banReason })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u =>
          u.id === selectedUser.id ? { ...u, is_active: u.is_active ? 0 : 1 } : u
        ));
        setBanModalOpen(false);
        setBanReason('');
      } else {
        alert(data.message);
      }
    } catch {
      alert('Lỗi kết nối');
    } finally {
      setBanLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedUser) return;
    setVerifyLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${selectedUser.id}/verify-company`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u =>
          u.id === selectedUser.id ? { ...u, company_verified: 1 } : u
        ));
        setVerifyModalOpen(false);
      } else {
        alert(data.message);
      }
    } catch {
      alert('Lỗi kết nối');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleViewDetail = async (user: UserItem) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setDetailData(data.data);
    } catch {
      alert('Lỗi kết nối');
    } finally {
      setDetailLoading(false);
    }
  };

  const getDisplayName = (user: UserItem) => {
    if (!user) return 'Unknown';
    return user.role === 'employer'
      ? (user.company_name || user.display_name || user.username)
      : (user.display_name || user.username);
  };

  const getStatusBadge = (user: UserItem) => {
    if (!user) return null;
    if (!user.is_active) return <Badge variant="destructive">Banned</Badge>;
    if (user.role === 'employer' && !user.company_verified) return <Badge variant="warning">Pending Verification</Badge>;
    return <Badge variant="success">Active</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User & Company Management</h1>
          <p className="text-slate-500 mt-1">Manage accounts, verify companies, and handle suspensions.</p>
        </div>
        <Button onClick={() => fetchUsers(pagination.page)}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-slate-700' },
          { label: 'Candidates', value: stats.total_candidates, color: 'text-blue-600' },
          { label: 'Employers', value: stats.total_employers, color: 'text-indigo-600' },
          { label: 'Pending', value: stats.total_pending, color: 'text-amber-600' },
          { label: 'Banned', value: stats.total_banned, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Table Card */}
      <Card>
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs defaultValue="all" onValueChange={v => { setFilter(v); }}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="employers">Employers</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                {stats.total_pending > 0 && (
                  <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {stats.total_pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="banned">Banned</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search name or email..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /><span>Đang tải...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User / Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(Boolean).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : users.filter(Boolean).map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                          {user.role === 'employer' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 flex items-center gap-2">
                            {getDisplayName(user)}
                            {user.role === 'employer' && user.company_verified === 1 && (
                              <Badge variant="success" className="h-4 px-1 text-[10px]">Verified</Badge>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Verify button - chỉ hiện với employer chưa verify */}
                        {user.role === 'employer' && !user.company_verified && user.is_active === 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => { setSelectedUser(user); setVerifyModalOpen(true); }}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verify
                          </Button>
                        )}
                        {/* View detail */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500"
                          onClick={() => handleViewDetail(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {/* Ban/Unban */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${user.is_active ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title={user.is_active ? 'Suspend User' : 'Unban User'}
                          onClick={() => { setSelectedUser(user); setBanModalOpen(true); }}
                        >
                          {user.is_active ? <Ban className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                <span>Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={pagination.page === 1} onClick={() => fetchUsers(pagination.page - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={pagination.page === pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Ban / Unban Modal */}
      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.is_active ? 'Confirm Account Suspension' : 'Confirm Unban Account'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.is_active
                ? <>Are you sure you want to suspend <strong>{getDisplayName(selectedUser!)}</strong>? They will lose access immediately.</>
                : <>Are you sure you want to unban <strong>{getDisplayName(selectedUser!)}</strong>? They will regain full access.</>
              }
            </DialogDescription>
          </DialogHeader>
          {selectedUser?.is_active === 1 && (
            <div className="py-2">
              <label className="text-sm font-medium text-slate-900">Reason (optional)</label>
              <Input
                className="mt-2"
                placeholder="e.g. Violation of Terms of Service"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanModalOpen(false)}>Cancel</Button>
            <Button
              variant={selectedUser?.is_active ? 'destructive' : 'default'}
              onClick={handleBan}
              disabled={banLoading}
            >
              {banLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedUser?.is_active ? 'Confirm Suspension' : 'Confirm Unban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Company Modal */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Company</DialogTitle>
            <DialogDescription>
              Confirm verification for <strong>{selectedUser?.company_name}</strong>? This will mark the company as trusted on the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyModalOpen(false)}>Cancel</Button>
            <Button onClick={handleVerify} disabled={verifyLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {verifyLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Detail</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : detailData ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-slate-500">Username</p><p className="font-medium">{detailData.username}</p></div>
                <div><p className="text-slate-500">Email</p><p className="font-medium">{detailData.email}</p></div>
                <div><p className="text-slate-500">Role</p><p className="font-medium capitalize">{detailData.role}</p></div>
                <div><p className="text-slate-500">Status</p><p className="font-medium">{detailData.is_active ? 'Active' : 'Banned'}</p></div>
                {detailData.role === 'candidate' && (
                  <>
                    <div><p className="text-slate-500">Full Name</p><p className="font-medium">{detailData.full_name || '—'}</p></div>
                    <div><p className="text-slate-500">Phone</p><p className="font-medium">{detailData.phone || '—'}</p></div>
                    <div><p className="text-slate-500">Applications</p><p className="font-medium">{detailData.total_applications}</p></div>
                  </>
                )}
                {detailData.role === 'employer' && (
                  <>
                    <div><p className="text-slate-500">Company</p><p className="font-medium">{detailData.company_name || '—'}</p></div>
                    <div><p className="text-slate-500">Verified</p><p className="font-medium">{detailData.company_verified ? '✅ Yes' : '❌ No'}</p></div>
                    <div><p className="text-slate-500">Total Jobs</p><p className="font-medium">{detailData.total_jobs}</p></div>
                    <div><p className="text-slate-500">Website</p><p className="font-medium">{detailData.website || '—'}</p></div>
                  </>
                )}
                <div><p className="text-slate-500">Joined</p><p className="font-medium">{new Date(detailData.created_at).toLocaleDateString('vi-VN')}</p></div>
              </div>
              {detailData.bio && (
                <div><p className="text-slate-500">Bio</p><p className="text-slate-700 mt-1">{detailData.bio}</p></div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}