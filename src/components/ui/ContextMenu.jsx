import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function ContextMenu({ actions }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!actions || actions.length === 0) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-900 ring-1 ring-black ring-opacity-5 dark:ring-white/10 divide-y divide-slate-100 dark:divide-slate-800 z-50 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="py-1">
            {actions.map((action, index) => {
              if (action.hidden) return null;
              
              const isDanger = action.variant === 'danger';
              const Icon = action.icon;
              
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    if (action.onClick) action.onClick();
                  }}
                  className={`group flex items-center w-full px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    isDanger 
                      ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30' 
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {Icon && (
                    <Icon className={`mr-3 h-4 w-4 ${isDanger ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400'}`} />
                  )}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
