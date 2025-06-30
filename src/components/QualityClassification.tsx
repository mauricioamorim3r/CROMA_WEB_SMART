import React from 'react';
import { GasQuality, getQualityValidationDetails } from '../utils/gas-quality-classifier';
import { ValidationMethod, determineValidationMethod } from '../utils/validation-method-selector';

interface ComponentData {
  name: string;
  molarPercent: string;
}

interface QualityClassificationProps {
  components: ComponentData[];
  temperature: number;
  pressure: number;
}

// ✅ COMPONENTE CLASSIFICAÇÃO - Componente de classificação de qualidade
export const QualityClassification: React.FC<QualityClassificationProps> = ({
  components,
  temperature,
  pressure
}) => {
  
  const qualityDetails = getQualityValidationDetails(components);
  const validationCriteria = determineValidationMethod(components, temperature, pressure);
  
  const getQualityBadgeClass = (quality: GasQuality) => {
    switch (quality) {
      case GasQuality.Pipeline:
        return "bg-green-100 text-green-800 border-green-200";
      case GasQuality.Intermediate:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case GasQuality.OutOfSpecification:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getMethodBadgeClass = (method: ValidationMethod) => {
    switch (method) {
      case ValidationMethod.AGA8_DETAIL:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case ValidationMethod.AGA8_GROSS:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case ValidationMethod.GERG2008:
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Classificação e Método de Validação</h3>
      
      {/* Qualidade do Gás */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Qualidade do Gás (AGA-8 Part 2)
        </label>
        <span 
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getQualityBadgeClass(qualityDetails.quality)}`}
        >
          {qualityDetails.quality}
        </span>
      </div>
      
      {/* Método de Validação */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Validação
        </label>
        <span 
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getMethodBadgeClass(validationCriteria.method)}`}
        >
          {validationCriteria.method}
        </span>
        <p className="text-sm text-gray-600 mt-1">{validationCriteria.reason}</p>
      </div>
      
      {/* Violações */}
      {qualityDetails.violations.pipeline.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-700 mb-2">
            Violações Pipeline Quality:
          </h4>
          <ul className="text-sm text-red-600 space-y-1">
            {qualityDetails.violations.pipeline.map((violation, index) => (
              <li key={index}>• {violation}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Status Operacional */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Faixa Operacional
        </label>
        <span 
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${
            validationCriteria.isValid 
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200"
          }`}
        >
          {validationCriteria.operationalRange.toUpperCase()} 
          {validationCriteria.isValid ? " ✓" : " ✗"}
        </span>
      </div>
    </div>
  );
}; 