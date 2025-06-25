import React, { useState } from 'react';
import { AVAILABLE_TEMPLATES, ReportTemplate } from '../constants';
import { ReportData } from '../types';

interface TemplateSelectorProps {
  onTemplateSelect: (templateData: Partial<ReportData>) => void;
  onClose: () => void;
  isOpen: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  onClose,
  isOpen
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', name: 'Todos', icon: '📋' },
    { id: 'offshore', name: 'Offshore', icon: '🛢️' },
    { id: 'onshore', name: 'Onshore', icon: '🏭' },
    { id: 'laboratory', name: 'Laboratório', icon: '🧪' },
    { id: 'industrial', name: 'Industrial', icon: '🏗️' }
  ];

  const filteredTemplates = AVAILABLE_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template: ReportTemplate) => {
    onTemplateSelect(template.data);
    onClose();
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Selecionar Template</h2>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-custom focus:border-lime-custom"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-lime-custom text-purple-custom'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6">
          {filteredTemplates.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">Nenhum template encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros ou termo de busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="p-6 rounded-xl border border-gray-200 transition-shadow cursor-pointer hover:shadow-lg group"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 text-4xl">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-purple-custom">
                        {template.name}
                      </h3>
                      <p className="mb-3 text-sm text-gray-600 line-clamp-3">
                        {template.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          template.category === 'offshore' ? 'bg-blue-100 text-blue-800' :
                          template.category === 'onshore' ? 'bg-green-100 text-green-800' :
                          template.category === 'laboratory' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {template.category}
                        </span>
                        <span className="transition-colors text-lime-custom group-hover:text-purple-custom">
                          Selecionar →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredTemplates.length} template(s) disponível(is)
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 rounded-lg border border-gray-300 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector; 