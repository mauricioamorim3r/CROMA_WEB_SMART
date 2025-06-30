import React, { useState, useEffect } from 'react';
import { CEPHistoricalSample, CEP_COLUMNS_CONFIG } from '../types';

interface CEPHistoryEditorProps {
  onDataUpdate?: (updatedData: CEPHistoricalSample[]) => void;
}

const CEPHistoryEditor: React.FC<CEPHistoryEditorProps> = ({ onDataUpdate }) => {
  const [samples, setSamples] = useState<CEPHistoricalSample[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: number | string }>({});
  const [editReason, setEditReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    id: string;
    changes: { [key: string]: number | string };
    originalValues: { [key: string]: number | string };
  } | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    loadCEPData();
  }, []);

  const loadCEPData = () => {
    try {
      const storedData = localStorage.getItem('cep_historical_samples');
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Validar e sanitizar dados carregados
        const validatedData = data.map((sample: any) => ({
          ...sample,
          dataColeta: sample.dataColeta || '',
          dataEmissaoRelatorio: sample.dataEmissaoRelatorio || '',
          dataValidacao: sample.dataValidacao || new Date().toISOString(),
          boletimNumber: sample.boletimNumber || '',
          totalComposicao: sample.totalComposicao ?? 0,
          components: sample.components || {},
          properties: {
            fatorCompressibilidade: sample.properties?.fatorCompressibilidade ?? 0,
            massaEspecifica: sample.properties?.massaEspecifica ?? 0,
            massaMolecular: sample.properties?.massaMolecular ?? 0,
            condicaoReferencia: sample.properties?.condicaoReferencia ?? ''
          },
          editHistory: sample.editHistory || []
        }));
        
        const sortedData = validatedData.sort((a: CEPHistoricalSample, b: CEPHistoricalSample) => 
          new Date(b.dataValidacao).getTime() - new Date(a.dataValidacao).getTime()
        );
        setSamples(sortedData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados CEP:', error);
      // Em caso de erro, limpar dados corrompidos
      localStorage.removeItem('cep_historical_samples');
      setSamples([]);
    }
  };

  const saveCEPData = (updatedSamples: CEPHistoricalSample[]) => {
    try {
      localStorage.setItem('cep_historical_samples', JSON.stringify(updatedSamples));
      setSamples(updatedSamples);
      if (onDataUpdate) {
        onDataUpdate(updatedSamples);
      }
    } catch (error) {
      console.error('Erro ao salvar dados CEP:', error);
    }
  };

  const startEdit = (sample: CEPHistoricalSample) => {
    setEditingId(sample.id);
    const allValues: { [key: string]: number | string } = {
      // Datas
      dataColeta: sample.dataColeta || '',
      dataEmissaoRelatorio: sample.dataEmissaoRelatorio || '',
      dataValidacao: sample.dataValidacao || '',
      // Componentes - garantir valores numéricos válidos
      ...Object.fromEntries(
        Object.entries(sample.components || {}).map(([key, value]) => [key, value ?? 0])
      ),
      // Total
      totalComposicao: sample.totalComposicao ?? 0,
      // Propriedades - garantir valores válidos
      fatorCompressibilidade: sample.properties?.fatorCompressibilidade ?? 0,
      massaEspecifica: sample.properties?.massaEspecifica ?? 0,
      massaMolecular: sample.properties?.massaMolecular ?? 0,
      condicaoReferencia: sample.properties?.condicaoReferencia ?? ''
    };
    setEditValues(allValues);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
    setEditReason('');
  };

  const prepareToSave = () => {
    if (!editingId) return;

    const sample = samples.find(s => s.id === editingId);
    if (!sample) return;

    const changes: { [key: string]: number | string } = {};
    const originalValues: { [key: string]: number | string } = {};
    
    // Verificar mudanças nas datas
    CEP_COLUMNS_CONFIG.dates.forEach(({ key }) => {
      const originalValue = (sample as any)[key];
      const newValue = editValues[key];
      if (newValue !== originalValue) {
        changes[key] = newValue;
        originalValues[key] = originalValue;
      }
    });

    // Verificar mudanças nos componentes
    CEP_COLUMNS_CONFIG.components.forEach(({ key }) => {
      const originalValue = sample.components[key as keyof typeof sample.components];
      const newValue = editValues[key];
      if (newValue !== undefined && newValue !== originalValue) {
        changes[key] = newValue;
        originalValues[key] = originalValue;
      }
    });

    // Verificar mudanças nas propriedades
    const propertyMap = {
      fatorCompressibilidade: sample.properties.fatorCompressibilidade,
      massaEspecifica: sample.properties.massaEspecifica,
      massaMolecular: sample.properties.massaMolecular,
      condicaoReferencia: sample.properties.condicaoReferencia
    };

    Object.entries(propertyMap).forEach(([key, originalValue]) => {
      const newValue = editValues[key];
      if (newValue !== undefined && newValue !== originalValue) {
        changes[key] = newValue;
        originalValues[key] = originalValue;
      }
    });

    // Verificar total
    if (editValues.totalComposicao !== undefined && editValues.totalComposicao !== sample.totalComposicao) {
      changes.totalComposicao = editValues.totalComposicao;
      originalValues.totalComposicao = sample.totalComposicao;
    }

    if (Object.keys(changes).length === 0) {
      cancelEdit();
      return;
    }

    setPendingChanges({
      id: editingId,
      changes,
      originalValues
    });
    setShowReasonModal(true);
  };

  const confirmSave = async () => {
    if (!pendingChanges || !editReason.trim()) return;

    setIsRecalculating(true);

    const updatedSamples = samples.map(sample => {
      if (sample.id === pendingChanges.id) {
        const now = new Date().toLocaleString('pt-BR');
        const changedFields = Object.keys(pendingChanges.changes);
        
        const editHistoryEntry = {
          date: now,
          reason: editReason.trim(),
          changedFields,
          previousValues: pendingChanges.originalValues
        };

        const updatedSample = { ...sample };

        // Aplicar mudanças
        Object.entries(pendingChanges.changes).forEach(([key, value]) => {
          if (CEP_COLUMNS_CONFIG.dates.some(d => d.key === key)) {
            (updatedSample as any)[key] = value;
          } else if (CEP_COLUMNS_CONFIG.components.some(c => c.key === key)) {
            (updatedSample.components as any)[key] = value;
          } else if (key === 'totalComposicao') {
            updatedSample.totalComposicao = value as number;
          } else {
            // Propriedades
            (updatedSample.properties as any)[key] = value;
          }
        });

        return {
          ...updatedSample,
          editHistory: [
            ...(sample.editHistory || []),
            editHistoryEntry
          ]
        };
      }
      return sample;
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    saveCEPData(updatedSamples);
    
    setEditingId(null);
    setEditValues({});
    setEditReason('');
    setShowReasonModal(false);
    setPendingChanges(null);
    setIsRecalculating(false);

    alert('✅ Dados atualizados com sucesso! Os valores CEP foram recalculados automaticamente.');
  };

  const formatValue = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null) return '0.0000';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(4);
    }
    return '0.0000';
  };

  const handleInputChange = (field: string, value: string) => {
    const isDateField = CEP_COLUMNS_CONFIG.dates.some(d => d.key === field);
    const isStringField = field === 'condicaoReferencia';
    
    const processedValue = (isDateField || isStringField) ? value : (parseFloat(value) || 0);
    
    setEditValues(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const getDisplayValue = (sample: CEPHistoricalSample, field: string): number | string => {
    if (field === 'dataColeta') return sample.dataColeta || '';
    if (field === 'dataEmissaoRelatorio') return sample.dataEmissaoRelatorio || '';
    if (field === 'dataValidacao') return sample.dataValidacao || '';
    if (field === 'boletimNumber') return sample.boletimNumber || '';
    if (field === 'totalComposicao') return sample.totalComposicao ?? 0;
    
    if (CEP_COLUMNS_CONFIG.components.some(c => c.key === field)) {
      return (sample.components as any)?.[field] ?? 0;
    }
    
    if (field === 'fatorCompressibilidade') return sample.properties?.fatorCompressibilidade ?? 0;
    if (field === 'massaEspecifica') return sample.properties?.massaEspecifica ?? 0;
    if (field === 'massaMolecular') return sample.properties?.massaMolecular ?? 0;
    if (field === 'condicaoReferencia') return sample.properties?.condicaoReferencia ?? '';
    
    return 0;
  };

  // Todas as colunas para exibição
  const allColumns = [
    ...CEP_COLUMNS_CONFIG.dates.map(d => d.key),
    ...CEP_COLUMNS_CONFIG.metadata.map(m => m.key),
    ...CEP_COLUMNS_CONFIG.components.map(c => c.key),
    ...CEP_COLUMNS_CONFIG.totals.map(t => t.key),
    'fatorCompressibilidade',
    'massaEspecifica', 
    'massaMolecular',
    'condicaoReferencia'
  ];

  const getColumnLabel = (field: string): string => {
    const dateCol = CEP_COLUMNS_CONFIG.dates.find(d => d.key === field);
    if (dateCol) return dateCol.label;
    
    const metaCol = CEP_COLUMNS_CONFIG.metadata.find(m => m.key === field);
    if (metaCol) return metaCol.label;
    
    const compCol = CEP_COLUMNS_CONFIG.components.find(c => c.key === field);
    if (compCol) return compCol.label;
    
    const totalCol = CEP_COLUMNS_CONFIG.totals.find(t => t.key === field);
    if (totalCol) return totalCol.label;
    
    const propCol = CEP_COLUMNS_CONFIG.properties.find(p => p.key === field);
    if (propCol) return propCol.label;
    
    return field;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📝</span>
          <h2 className="text-xl font-bold text-gray-800">Editor de Histórico CEP</h2>
          <span className="text-sm text-gray-500">({samples.length} amostras)</span>
        </div>

        {isRecalculating && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <span className="text-blue-600 animate-spin">⚙️</span>
            <span className="text-blue-800">Recalculando valores CEP...</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-600">
                {allColumns.map(field => (
                  <th key={field} className="border border-gray-400 px-2 py-3 text-xs font-bold text-white min-w-[100px]">
                    {getColumnLabel(field)}
                  </th>
                ))}
                <th className="border border-gray-400 px-2 py-3 text-xs font-bold text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((sample, index) => (
                <tr key={sample.id} className={editingId === sample.id ? 'bg-yellow-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {allColumns.map(field => (
                    <td key={field} className="border border-gray-300 px-2 py-1">
                      {editingId === sample.id ? (
                        <input
                          type={CEP_COLUMNS_CONFIG.dates.some(d => d.key === field) ? 'date' : 
                                field === 'condicaoReferencia' ? 'text' : 'number'}
                          step={field === 'condicaoReferencia' ? undefined : "0.0001"}
                          value={editValues[field] ?? (field === 'condicaoReferencia' ? '' : 0)}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <span className="text-xs font-mono">
                          {CEP_COLUMNS_CONFIG.dates.some(d => d.key === field) ? 
                            (() => {
                              const dateValue = getDisplayValue(sample, field) as string;
                              try {
                                return dateValue ? new Date(dateValue).toLocaleDateString('pt-BR') : '-';
                              } catch {
                                return '-';
                              }
                            })() :
                            formatValue(getDisplayValue(sample, field))
                          }
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {editingId === sample.id ? (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={prepareToSave}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1"
                        >
                          💾 Salvar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 flex items-center gap-1"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(sample)}
                        disabled={editingId !== null}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-1"
                      >
                        ✏️ Editar
                      </button>
                    )}
                    {sample.editHistory && sample.editHistory.length > 0 && (
                      <span className="text-orange-500 ml-1" title="Dados editados">🕒</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {samples.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum dado histórico CEP encontrado
          </div>
        )}
      </div>

      {/* Modal para motivo da alteração */}
      {showReasonModal && pendingChanges && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-gray-800">Motivo da Alteração</h3>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Campos alterados: <strong>{Object.keys(pendingChanges.changes).join(', ')}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Esta alteração será registrada no histórico com data/hora.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificativa da alteração: <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Correção de erro de transcrição, Ajuste conforme revisão técnica..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setPendingChanges(null);
                  setEditReason('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSave}
                disabled={!editReason.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CEPHistoryEditor; 