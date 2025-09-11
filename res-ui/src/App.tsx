import { useState, useEffect, useMemo } from 'react'
import './App.css'
import resources from './assets/resources.json' // Import the JSON data
import { Checkbox } from './components/ui/checkbox'
import { Label } from './components/ui/label'
import { PanelRight } from 'lucide-react'
import { Input } from './components/ui/input' // Import the Input component
import { useDebounce } from './lib/useDebounce'

interface Resource {
  url: string;
  categories: string[];
}

function App() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // State for sidebar toggle
  const [resourceSearchQuery, setResourceSearchQuery] = useState('') // Immediate resource search query
  const [categorySearchQuery, setCategorySearchQuery] = useState('') // Immediate category search query
  const debouncedResourceSearch = useDebounce(resourceSearchQuery, 250)
  const debouncedCategorySearch = useDebounce(categorySearchQuery, 250)

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isSidebarOpen])

  // Get all categories from resources (stable list)
  const allCategories = useMemo(() => Array.from(
    new Set(resources.flatMap(resource => resource.categories))
  ).sort(), [])

  // Precompute total counts per category
  const totalCategoryCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of resources) {
      for (const c of r.categories) {
        counts[c] = (counts[c] || 0) + 1
      }
    }
    return counts
  }, [])
  
  // Filter + sort categories by total count desc
  const filteredCategories = useMemo(() => {
    const base = debouncedCategorySearch
      ? allCategories.filter(category =>
          category.toLowerCase().includes(debouncedCategorySearch.toLowerCase())
        )
      : allCategories
    return [...base].sort((a, b) => (totalCategoryCounts[b] || 0) - (totalCategoryCounts[a] || 0))
  }, [allCategories, debouncedCategorySearch, totalCategoryCounts])

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    )
  }

  const handleTagClick = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  // Filter resources based on selected categories and resource search query (URL or tags)
  const filteredResources: Resource[] = resources.filter(resource => {
    // Filter by selected categories (if any are selected)
    const matchesCategory = selectedCategories.length === 0 || resource.categories.some(category => selectedCategories.includes(category))
    // Filter by resource search query (URL or tags)
    const search = debouncedResourceSearch.trim().toLowerCase()
    const matchesSearch =
      !search ||
      resource.url.toLowerCase().includes(search) ||
      resource.categories.some(cat => cat.toLowerCase().includes(search))
    return matchesCategory && matchesSearch
  })

  // Filtered counts after current resource search query (ignoring category selection so user can see potential counts)
  const filteredCategoryCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {}
    const search = debouncedResourceSearch.trim().toLowerCase()
    for (const r of resources) {
      // Only consider resources that match the resource search query (URL or tags)
      if (search &&
        !r.url.toLowerCase().includes(search) &&
        !r.categories.some(cat => cat.toLowerCase().includes(search))
      ) continue
      for (const c of r.categories) {
        counts[c] = (counts[c] || 0) + 1
      }
    }
    // If no resource search query entered, fallback to total counts for quick access
    return search ? counts : totalCategoryCounts
  }, [resources, debouncedResourceSearch, totalCategoryCounts])

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar Toggle Button */}
        <button
          className="p-2 m-2 rounded fixed top-4 left-4 flex items-center justify-center md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Categories Sidebar"
        >
          <PanelRight size={24} /> {/* Specify size for visibility */}
        </button>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <aside
          className={`fixed top-0 left-0 h-full bg-gray-100 p-4 resize-x overflow-x-auto transition-transform transform z-50 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:sticky md:top-0 md:w-64 md:translate-x-0`}
        >
          <button
            className="p-2 m-2 rounded md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            Close
          </button>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search categories..."
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
            />
          </div>
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="checkbox-group space-y-2">
            <Label className="flex items-center justify-between cursor-pointer pr-2">
              <Checkbox
                checked={selectedCategories.length === 0}
                onCheckedChange={() => setSelectedCategories([])}
                className="mr-2"
              />
              <span className="flex-1">All</span>
              <span className="text-xs font-mono bg-white rounded px-1 py-0.5 border">
                {resources.length}
              </span>
            </Label>
            {filteredCategories.map(category => {
              const total = totalCategoryCounts[category] || 0
              const filteredMatch = filteredCategoryCounts[category] || 0
              const isSelected = selectedCategories.includes(category)
              return (
                <Label key={category} className={`flex items-center justify-between cursor-pointer pr-2 ${isSelected ? 'bg-white rounded border' : ''}`}
                  aria-label={`Category ${category}, ${filteredMatch} matching, ${total} total`}
                >
                  <span className="flex items-center flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleCategoryChange(category)}
                      className="mr-2"
                      aria-checked={isSelected}
                      tabIndex={0}
                    />
                    <span className="truncate" title={category}>{category}</span>
                  </span>
                  <span className="ml-2 flex items-center gap-1 text-[10px] font-mono">
                    <span className="px-1 py-0.5 bg-white border rounded" title="Matching current resource search">{filteredMatch}</span>
                    <span className="opacity-50">/</span>
                    <span className="px-1 py-0.5 bg-gray-200 rounded" title="Total resources in category">{total}</span>
                  </span>
                </Label>
              )
            })}
          </div>
        </aside>

        <main className="md:w-5/6 w-full p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search resources..."
                value={resourceSearchQuery}
                onChange={(e) => setResourceSearchQuery(e.target.value)}
                aria-label="Search resources by URL"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded border" aria-live="polite">
                Showing {filteredResources.length} of {resources.length}
              </span>
              {(selectedCategories.length > 0 || resourceSearchQuery) && (
                <button
                  onClick={() => { setSelectedCategories([]); setResourceSearchQuery('') }}
                  className="text-xs px-2 py-1 border rounded bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4" aria-label="Active category filters">
              {selectedCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className="group flex items-center gap-1 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded hover:bg-blue-100"
                  aria-pressed="true"
                >
                  <span className="truncate max-w-[140px]">{cat}</span>
                  <span className="opacity-60 group-hover:opacity-90" aria-hidden>&times;</span>
                </button>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-bold mb-4">Resources</h1>
          {filteredResources.length === 0 ? (
            <div className="p-8 border border-dashed rounded text-center text-sm text-gray-600">
              <p className="mb-2 font-medium">No resources match your filters.</p>
              <p>Try adjusting category selections or search terms.</p>
            </div>
          ) : (
            <div className="resources grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map(resource => {
                let origin: string | null = null
                try { origin = new URL(resource.url).origin } catch {}
                const favicon = origin ? `${origin}/favicon.ico` : null
                return (
                  <div key={resource.url} className="group relative block p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 ring-blue-200">
                    <div className="flex items-start gap-3">
                      {favicon && (
                        <img
                          src={favicon}
                          alt=""
                          loading="lazy"
                          className="w-5 h-5 rounded-sm border bg-gray-100 object-contain"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-medium underline underline-offset-2 break-words group-hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-sm"
                        >
                          {resource.url}
                        </a>
                        <div className="flex flex-wrap gap-1">
                          {resource.categories.map(category => (
                            <button
                              key={category}
                              onClick={() => handleTagClick(category)}
                              className={`text-[10px] px-2 py-1 rounded border transition-colors ${selectedCategories.includes(category) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                              aria-pressed={selectedCategories.includes(category)}
                              role="button"
                              tabIndex={0}
                              aria-label={`Toggle filter for category ${category}`}
                            >
                              #{category}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={() => { navigator.clipboard.writeText(resource.url) }}
                          className="text-[10px] px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100"
                          aria-label="Copy link"
                        >Copy</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default App
