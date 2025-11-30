import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'All Guides' },
  { id: 'Awareness', label: 'Awareness' },
  { id: 'Seasonal', label: 'Seasonal' },
  { id: 'PNW', label: 'PNW' },
  { id: 'Smart Homeowner', label: 'Smart Homeowner' }
];

/**
 * Category filter tabs for Resource Center
 *
 * @param {string} activeCategory - Currently selected category
 * @param {Function} onCategoryChange - Callback when category changes
 * @param {Object} counts - Optional counts per category { Awareness: 4, Seasonal: 4, ... }
 */
export function CategoryTabs({ activeCategory = 'all', onCategoryChange, counts = {} }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id;
        const count = category.id === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[category.id] || 0;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange?.(category.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {category.label}
            {count > 0 && (
              <span className={cn(
                'ml-2 text-xs',
                isActive ? 'text-blue-100' : 'text-gray-500'
              )}>
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryTabs;
