import React from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   PieChart, Pie, Cell, Area, AreaChart
// } from 'recharts';
import { ReportData } from '../types';

interface AnalyticsDashboardProps {
  reportData: ReportData;
  isOpen: boolean;
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="p-6 w-full max-w-md bg-white rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Dashboard Analítico</h2>
            <button
              onClick={onClose}
            className="text-gray-500 transition-colors hover:text-gray-700"
            >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        <div className="p-4 text-center bg-yellow-50 rounded-lg border border-yellow-200 border-solid">
          <p className="text-yellow-800">
            📊 Dashboard temporariamente indisponível
          </p>
          <p className="mt-2 text-sm text-yellow-600">
            Aguardando instalação da biblioteca Recharts
          </p>
        </div>
        <div className="mt-4 text-right">
            <button
              onClick={onClose}
            className="px-4 py-2 text-white bg-purple-600 rounded-lg transition-colors hover:bg-purple-700"
            >
            Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;