'use client';

import { AVAILABLE_ICONS, getIconComponent } from '../../lib/utils/category-icons';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  selectedColor: string;
}

export function IconPicker({ value, onChange, selectedColor }: Readonly<IconPickerProps>) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Icono</label>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_ICONS.map((name) => {
          const Icon = getIconComponent(name);
          if (!Icon) return null;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                value === name
                  ? 'ring-2 ring-offset-2 ring-[var(--color-primary)] scale-110'
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: selectedColor }}
              title={name}
            >
              <Icon className="w-5 h-5 text-white" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
