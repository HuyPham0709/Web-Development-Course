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

  // Load data when changing tabs
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
      toast.error(err.response?.data?.message || 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  // Filter items by search query
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  // Open add modal
  const openAdd = () => {
    setEditItem(null)
    setForm({ name: '', slug: '' })
    setShowModal(true)
  }

  // Open edit modal
  const openEdit = (item: MetaItem) => {
    setEditItem(item)
    setForm({ name: item.name, slug: item.slug || '' })
    setShowModal(true)
  }

  // Auto-generate slug from name (Supports SEO-friendly conversion)
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

  // Submit form create/update
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Name field cannot be empty')
      return
    }
    setSubmitting(true)
    try {
      if (editItem) {
        // Update
        const res = await axios.put(
          `${API_URL}/${currentView.apiPath}/${editItem.id}`,
          form,
          { headers: getHeaders() }
        )
        setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...res.data.data } : i))
        toast.success('Updated successfully')
      } else {
        // Create new
        const res = await axios.post(
          `${API_URL}/${currentView.apiPath}`,
          form,
          { headers: getHeaders() }
        )
        setItems(prev => [...prev, res.data.data])
        toast.success('Added successfully')
      }
      setShowModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error occurred while saving')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete item
  const handleDelete = async (item: MetaItem) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return
    setDeletingId(item.id)
    try {
      await axios.delete(`${API_URL}/${currentView.apiPath}/${item.id}`, { headers: getHeaders() })
      setItems(prev => prev.filter(i => i.id !== item.id))
      toast.success('Deleted successfully')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error occurred while deleting')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight transition-colors duration-200">System Metadata</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-200">Manage categories, locations, and skills used across the platform.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="md:col-span-1 p-2 space-y-1 h-fit dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
          {VIEWS.map(view => (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${activeView === view.key
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
              <span className="ml-auto text-xs bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded-full transition-colors duration-200">
                {activeView === view.key ? items.length : ''}
              </span>
            </button>
          ))}
        </Card>

        {/* Main Table */}
        <Card className="md:col-span-3 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl transition-colors duration-200">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors duration-200" />
              <Input
                className="pl-9 bg-white dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 dark:placeholder:text-slate-500 transition-colors duration-200"
                placeholder={`Search ${currentView.label.toLowerCase()}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={openAdd} className="transition-colors duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400 dark:text-slate-500 transition-colors duration-200">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="dark:border-slate-800 transition-colors duration-200">
                  <TableHead className="dark:text-slate-400">Name</TableHead>
                  {activeView !== 'skills' && <TableHead className="dark:text-slate-400">Slug</TableHead>}
                  <TableHead className="dark:text-slate-400">Job Posts</TableHead>
                  {activeView === 'skills' && <TableHead className="dark:text-slate-400">Users</TableHead>}
                  <TableHead className="text-right dark:text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow className="dark:border-slate-800 hover:bg-transparent dark:hover:bg-transparent transition-colors duration-200">
                    <TableCell colSpan={4} className="text-center py-10 text-slate-400 dark:text-slate-500 transition-colors duration-200">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : filtered.map(item => (
                  <TableRow key={item.id} className="dark:border-slate-800 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100 transition-colors duration-200">{item.name}</TableCell>
                    {activeView !== 'skills' && (
                      <TableCell className="text-slate-400 dark:text-slate-500 text-xs font-mono transition-colors duration-200">{item.slug || '—'}</TableCell>
                    )}
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors duration-200 ${(item.job_count || 0) > 0
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                        {item.job_count || 0} jobs
                      </span>
                    </TableCell>
                    {activeView === 'skills' && (
                      <TableCell>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 transition-colors duration-200">
                          {item.user_count || 0} users
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                        className="text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors duration-200"
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-colors duration-200">
          <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transition-colors duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors duration-200">
                {editItem ? `Edit ${currentView.label}` : `Add ${currentView.label}`}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors duration-200">
                  Name <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder={`Enter ${currentView.label.toLowerCase()} name`}
                  autoFocus
                  className="dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 dark:placeholder:text-slate-500 transition-colors duration-200"
                />
              </div>

              {/* Slug displayed only for categories and locations */}
              {activeView !== 'skills' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors duration-200">
                    Slug <span className="text-slate-400 dark:text-slate-500 font-normal transition-colors duration-200">(SEO URL)</span>
                  </label>
                  <Input
                    value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="auto-generated-from-name"
                    className="font-mono text-sm text-slate-500 dark:text-slate-400 dark:bg-slate-950 dark:border-slate-800 transition-colors duration-200"
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors duration-200">
                    Used for URL: /jobs?location=<span className="font-mono">{form.slug || 'slug'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="transition-colors duration-200"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  : <><Check className="w-4 h-4 mr-2" /> {editItem ? 'Update' : 'Add New'}</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}