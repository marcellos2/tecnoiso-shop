import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, Gauge, Thermometer, Scale, Ruler, CircleDot, Zap } from 'lucide-react';
import { categories } from '@/data/products';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gauge,
  Thermometer,
  Scale,
  Ruler,
  CircleDot,
  Zap,
};

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-lg p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="font-semibold text-foreground">Category</h3>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
              selectedCategory === 'all'
                ? 'bg-foreground text-white'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>All Products</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
              selectedCategory === 'all' ? 'bg-white/20' : 'bg-muted'
            }`}>
              {categories.reduce((acc, c) => acc + c.productCount, 0)}
            </span>
          </button>

          {categories.map((category) => {
            const IconComponent = iconMap[category.icon] || Package;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-foreground text-white'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{category.name}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === category.id ? 'bg-white/20' : 'bg-muted'
                }`}>
                  {category.productCount}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
