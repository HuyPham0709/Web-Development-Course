import { useState, useEffect } from "react"
import { Search, Plus, Edit2, Trash2, FolderTree, MapPin, Tag, Loader2, X, Check } from "lucide-react"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { toast } from "sonner"
import axios from "axios"

const API_URL = 'http://localhost:5000/api/admin/metadata'

function getHeaders() {
  const token = localStorage.getItem('admin_token')
  return { Authorization: `Bearer ${token}` }
}

type ViewType = 'categories' | 'locations' | 'skills'

interface MetaItem {
  id: number
  name: string
  slug?: string
  job_count?: number
  user_count?: number
  created_at?: string
}

interface FormState {
  name: string
  slug: string
}

const VIEWS: { key: ViewType; label: string; icon: any; apiPath: string }[] = [
  { key: 'categories', label: 'Job Categories', icon: FolderTree, apiPath: 'categories' },
  { key: 'locations', label: 'Locations (SEO)', icon: MapPin, apiPath: 'locations' },
  { key: 'skills', label: 'Skill Tags', icon: Tag, apiPath: 'skills' },
]

export function Metadata() {
  const [activeView, setActiveView] = useState<ViewType>('categories')
  const [items, setItems] = useState<MetaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<MetaItem | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', slug: '' })
  const [submitting, setSubmitting] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const currentView = VIEWS.find(v => v.key === activeView)!

  // Load data khi đổi tab
  useEffect(() => {
    fetchItems()
    setSearch('')
  }, [activeView])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/${currentView.apiPath}`, { headers: getHeaders() })
      setItems(res.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  // Filter theo search
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  // Mở modal thêm mới
  const openAdd = () => {
    setEditItem(null)
    setForm({ name: '', slug: '' })
    setShowModal(true)
  }

  // Mở modal chỉnh sửa
  const openEdit = (item: MetaItem) => {
    setEditItem(item)
    setForm({ name: item.name, slug: item.slug || '' })
    setShowModal(true)
  }

  // Auto-generate slug từ name (Hỗ trợ tiếng Việt không dấu chuẩn SEO)
  const handleNameChange = (value: string) => {
    const generatedSlug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    setForm(prev => ({
      name: value,
      slug: generatedSlug
    }));
  }

  // Submit form thêm/sửa
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Tên không được để trống')
      return
    }
    setSubmitting(true)
    try {
      if (editItem) {
        // Cập nhật
        const res = await axios.put(
          `${API_URL}/${currentView.apiPath}/${editItem.id}`,
          form,
          { headers: getHeaders() }
        )
        setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...res.data.data } : i))
        toast.success('Đã cập nhật thành công')
      } else {
        // Thêm mới
        const res = await axios.post(
          `${API_URL}/${currentView.apiPath}`,
          form,
          { headers: getHeaders() }
        )
        setItems(prev => [...prev, res.data.data])
        toast.success('Đã thêm thành công')
      }
      setShowModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu')
    } finally { // <-- Đã sửa 'filly' thành từ khóa 'finally' chuẩn tại đây
      setSubmitting(false)
    }
  }

  // Xóa item
  const handleDelete = async (item: MetaItem) => {
    if (!window.confirm(`Xóa "${item.name}"?`)) return
    setDeletingId(item.id)
    try {
      await axios.delete(`${API_URL}/${currentView.apiPath}/${item.id}`, { headers: getHeaders() })
      setItems(prev => prev.filter(i => i.id !== item.id))
      toast.success('Đã xóa thành công')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Metadata</h1>
        <p className="text-slate-500 mt-1">Manage categories, locations, and skills used across the platform.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="md:col-span-1 p-2 space-y-1 h-fit">
          {VIEWS.map(view => (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeView === view.key
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
              <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                {activeView === view.key ? items.length : ''}
              </span>
            </button>
          ))}
        </Card>

        {/* Main Table */}
        <Card className="md:col-span-3">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9 bg-white"
                placeholder={`Tìm ${currentView.label.toLowerCase()}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  {activeView !== 'skills' && <TableHead>Slug</TableHead>}
                  <TableHead>Tin tuyển dụng</TableHead>
                  {activeView === 'skills' && <TableHead>Người dùng</TableHead>}
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : filtered.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                    {activeView !== 'skills' && (
                      <TableCell className="text-slate-400 text-xs font-mono">{item.slug || '—'}</TableCell>
                    )}
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${(item.job_count || 0) > 0
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                        }`}>
                        {item.job_count || 0} jobs
                      </span>
                    </TableCell>
                    {activeView === 'skills' && (
                      <TableCell>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          {item.user_count || 0} users
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                        className="text-slate-400 hover:text-indigo-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        {deletingId === item.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editItem ? `Sửa ${currentView.label}` : `Thêm ${currentView.label}`}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tên <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder={`Nhập tên ${currentView.label.toLowerCase()}`}
                  autoFocus
                />
              </div>

              {/* Slug chỉ hiện cho categories và locations */}
              {activeView !== 'skills' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Slug <span className="text-slate-400 font-normal">(SEO URL)</span>
                  </label>
                  <Input
                    value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="tu-dong-tao-tu-ten"
                    className="font-mono text-sm text-slate-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Dùng cho URL: /jobs?location=<span className="font-mono">{form.slug || 'slug'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</>
                  : <><Check className="w-4 h-4 mr-2" /> {editItem ? 'Cập nhật' : 'Thêm mới'}</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}