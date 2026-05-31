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
import { UserItem, UserStats, Pagination } from '../../../types'

const API_URL = 'http://localhost:5000/api/admin';

function getHeaders() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export function Users() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, total_candidates: 0, total_employers: 0, total_banned: 0, total_pending: 0 });
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
        setError(data.message || 'Error loading data');
      }
    } catch {
      setError('Unable to connect to the server');
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
      alert('Connection error');
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
      alert('Connection error');
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
      alert('Connection error');
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors duration-200">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight transition-colors duration-200">User & Company Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-200">Manage accounts, verify companies, and handle suspensions.</p>
        </div>
        <Button onClick={() => fetchUsers(pagination.page)} className="transition-all duration-200">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-slate-700 dark:text-slate-200' },
          { label: 'Candidates', value: stats.total_candidates, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Employers', value: stats.total_employers, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Pending', value: stats.total_pending, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Banned', value: stats.total_banned, color: 'text-red-600 dark:text-red-400' },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center dark:bg-slate-800 dark:border-slate-700 transition-all duration-200">
            <p className={`text-2xl font-bold ${s.color} transition-colors duration-200`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-200">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Table Card */}
      <Card className="dark:bg-slate-900 dark:border-slate-800 transition-all duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
          <Tabs defaultValue="all" onValueChange={v => { setFilter(v); }}>
            <TabsList className="dark:bg-slate-800">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="employers">Employers</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                {stats.total_pending > 0 && (
                  <span className="ml-1.5 bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 text-xs font-bold px-1.5 py-0.5 rounded-full transition-colors duration-200">
                    {stats.total_pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="banned">Banned</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors duration-200" />
            <Input
              className="pl-9 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 transition-all duration-200"
              placeholder="Search name or email..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400 dark:text-slate-500 transition-colors duration-200">
            <Loader2 className="w-5 h-5 animate-spin" /><span>Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 dark:text-red-400 text-sm transition-colors duration-200">{error}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="dark:border-slate-800">
                  <TableHead className="dark:text-slate-400">User / Company</TableHead>
                  <TableHead className="dark:text-slate-400">Role</TableHead>
                  <TableHead className="dark:text-slate-400">Status</TableHead>
                  <TableHead className="dark:text-slate-400">Joined Date</TableHead>
                  <TableHead className="text-right dark:text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(Boolean).length === 0 ? (
                  <TableRow className="dark:border-slate-800">
                    <TableCell colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500 transition-colors duration-200">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : users.filter(Boolean).map(user => (
                  <TableRow key={user.id} className="dark:border-slate-800 dark:hover:bg-slate-800/50 transition-colors duration-150">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors duration-200">
                          {user.role === 'employer' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 transition-colors duration-200">
                            {getDisplayName(user)}
                            {user.role === 'employer' && user.company_verified === 1 && (
                              <Badge variant="success" className="h-4 px-1 text-[10px]">Verified</Badge>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize dark:bg-slate-800 dark:text-slate-200">{user.role}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 transition-colors duration-200">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Verify button - chỉ hiện với employer chưa verify */}
                        {user.role === 'employer' && !user.company_verified && user.is_active === 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 transition-all duration-200"
                            onClick={() => { setSelectedUser(user); setVerifyModalOpen(true); }}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verify
                          </Button>
                        )}
                        {/* View detail */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all duration-200"
                          onClick={() => handleViewDetail(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {/* Ban/Unban */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 transition-all duration-200 ${user.is_active ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/30' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/30'}`}
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
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 transition-colors duration-200">
                <span>Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={pagination.page === 1} onClick={() => fetchUsers(pagination.page - 1)} className="transition-all duration-200 dark:border-slate-700 dark:bg-slate-800">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={pagination.page === pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)} className="transition-all duration-200 dark:border-slate-700 dark:bg-slate-800">
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
        <DialogContent className="dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">
              {selectedUser?.is_active ? 'Confirm Account Suspension' : 'Confirm Unban Account'}
            </DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              {selectedUser?.is_active
                ? <>Are you sure you want to suspend <strong className="text-slate-900 dark:text-white transition-colors duration-200">{getDisplayName(selectedUser!)}</strong>? They will lose access immediately.</>
                : <>Are you sure you want to unban <strong className="text-slate-900 dark:text-white transition-colors duration-200">{getDisplayName(selectedUser!)}</strong>? They will regain full access.</>
              }
            </DialogDescription>
          </DialogHeader>
          {selectedUser?.is_active === 1 && (
            <div className="py-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-200 transition-colors duration-200">Reason (optional)</label>
              <Input
                className="mt-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 transition-all duration-200"
                placeholder="e.g. Violation of Terms of Service"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanModalOpen(false)} className="transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">Cancel</Button>
            <Button
              variant={selectedUser?.is_active ? 'destructive' : 'default'}
              onClick={handleBan}
              disabled={banLoading}
              className="transition-all duration-200"
            >
              {banLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedUser?.is_active ? 'Confirm Suspension' : 'Confirm Unban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Company Modal */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">Verify Company</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Confirm verification for <strong className="text-slate-900 dark:text-white transition-colors duration-200">{selectedUser?.company_name}</strong>? This will mark the company as trusted on the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyModalOpen(false)} className="transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">Cancel</Button>
            <Button onClick={handleVerify} disabled={verifyLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 transition-all duration-200">
              {verifyLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">User Detail</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400 dark:text-slate-500 transition-colors duration-200" /></div>
          ) : detailData ? (
            <div className="space-y-3 text-sm text-slate-900 dark:text-slate-100 transition-colors duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-slate-500">Username</p><p className="font-medium">{detailData.username}</p></div>
                <div><p className="text-slate-500">Email</p><p className="font-medium">{detailData.email}</p></div>
                <div><p className="text-slate-500">Role</p><p className="font-medium capitalize">{detailData.role}</p></div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="font-medium">{detailData.is_active ? 'Active' : 'Banned'}</p>
                </div>
                {!detailData.is_active && (
                  <div className="col-span-2">
                    <p className="text-slate-500">Ban Reason</p>
                    <div className="mt-1 flex items-start gap-2 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                      <span className="text-red-500 mt-0.5">⚠️</span>
                      <p className="text-red-700 font-medium text-sm">
                        {detailData.ban_reason || 'No specific reason provided.'}
                      </p>
                    </div>
                  </div>
                )}
                {detailData.role === 'candidate' && (
                  <>
                    <div><p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">Full Name</p><p className="font-medium text-slate-900 dark:text-slate-200 transition-colors duration-200">{detailData.full_name || '—'}</p></div>
                    <div><p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">Phone</p><p className="font-medium text-slate-900 dark:text-slate-200 transition-colors duration-200">{detailData.phone || '—'}</p></div>
                    <div><p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">Applications</p><p className="font-medium text-slate-900 dark:text-slate-200 transition-colors duration-200">{detailData.total_applications}</p></div>
                  </>
                )}
                {detailData.role === 'employer' && (
                  <>
                    <div><p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">Company</p><p className="font-medium text-slate-900 dark:text-slate-200 transition-colors duration-200">{detailData.company_name || '—'}</p></div>
                    <div><p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">Verified</p><p className="font-medium text-slate-900 dark:text-slate-200 transition-colors duration-200">{detailData.company_verified ? '✅ Yes' : '❌ No'}</p></div>
                    <div><p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">Total Jobs</p><p className="font-medium text-slate-900 dark:text-slate-200 transition-colors duration-200">{detailData.total_jobs}</p></div>
                    <div><p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">Website</p><p className="font-medium text-slate-900 dark:text-slate-200 transition-colors duration-200">{detailData.website || '—'}</p></div>
                  </>
                )}
                <div><p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">Joined</p><p className="font-medium text-slate-900 dark:text-slate-200 transition-colors duration-200">{new Date(detailData.created_at).toLocaleDateString('vi-VN')}</p></div>
              </div>
              {detailData.bio && (
                <div><p className="text-slate-500 dark:text-slate-400 transition-colors duration-200">Bio</p><p className="text-slate-700 dark:text-slate-300 mt-1 transition-colors duration-200">{detailData.bio}</p></div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)} className="transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}