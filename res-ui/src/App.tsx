import { useState, useEffect } from 'react'
import './App.css'
import resources from './assets/resources.json' // Import the JSON data
import { Checkbox } from './components/ui/checkbox'
import { Label } from './components/ui/label'
import { PanelRight } from 'lucide-react'
import { Input } from './components/ui/input' // Import the Input component

interface Resource {
  url: string;
  categories: string[];
}

function App() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // State for sidebar toggle
  const [resourceSearchQuery, setResourceSearchQuery] = useState('') // State for resource search query
  const [categorySearchQuery, setCategorySearchQuery] = useState('') // State for category search query

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isSidebarOpen])

  // Get all categories from resources
  const allCategories = Array.from(
    new Set(resources.flatMap(resource => resource.categories))
  )
  
  // Filter categories based on category search query
  const filteredCategories = categorySearchQuery
    ? allCategories.filter(category => 
        category.toLowerCase().includes(categorySearchQuery.toLowerCase())
      )
    : allCategories;

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

  // Filter resources based on selected categories and resource search query
  const filteredResources: Resource[] = resources.filter(resource =>
    // Filter by selected categories (if any are selected)
    (selectedCategories.length === 0 || resource.categories.some(category => selectedCategories.includes(category))) &&
    // Filter by resource search query (looking only at URL)
    (resourceSearchQuery === '' || resource.url.toLowerCase().includes(resourceSearchQuery.toLowerCase()))
  )

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
          className={`fixed top-0 left-0 h-full bg-gray-100 p-4 resize-x overflow-x-auto overflow-y-auto transition-transform transform z-50 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:static md:w-1/6 md:translate-x-0 md:sticky md:top-0`}
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
            <Label className="flex items-center cursor-pointer">
              <Checkbox
                checked={selectedCategories.length === 0}
                onCheckedChange={() => setSelectedCategories([])}
                className="mr-2"
              />
              All
            </Label>
            {filteredCategories.map(category => (
              <Label key={category} className="flex items-center cursor-pointer">
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                  className="mr-2"
                />
                {category}
              </Label>
            ))}
          </div>
        </aside>

        <main className="md:w-5/6 w-full p-4">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search resources..."
              value={resourceSearchQuery}
              onChange={(e) => setResourceSearchQuery(e.target.value)}
            />
          </div>
          <h1 className="text-2xl font-bold mb-4">Resources</h1>
          <div className="resources grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(resource => (
              <div key={resource.url} className="block p-4 border rounded hover:bg-gray-50 shadow-md">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline break-all whitespace-normal"
                >
                  {resource.url}
                </a>
                <div className="mt-2 flex flex-wrap gap-2">
                  {resource.categories.map(category => (
                    <span
                      key={category}
                      className="text-sm text-gray-600 cursor-pointer bg-gray-200 px-2 py-1 rounded"
                      onClick={() => handleTagClick(category)}
                    >
                      #{category}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}

export default App
