
import React from 'react';
import { LABEL_CLASS, INPUT_CLASS } from '../constants';

interface ReportHeaderProps {
  numeroUnicoRastreabilidade: string;
  onNumeroUnicoRastreabilidadeChange: (value: string) => void;
  dataRealizacaoAnaliseCritica: string;
  onDataRealizacaoAnaliseCriticaChange: (value: string) => void;
  revisaoAnaliseCritica: string;
  onRevisaoAnaliseCriticaChange: (value: string) => void;
  logoSrc: string | null;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  currentFontSizePercentage: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  numeroUnicoRastreabilidade,
  onNumeroUnicoRastreabilidadeChange,
  dataRealizacaoAnaliseCritica,
  onDataRealizacaoAnaliseCriticaChange,
  revisaoAnaliseCritica,
  onRevisaoAnaliseCriticaChange,
  logoSrc,
  onLogoUpload,
  currentFontSizePercentage,
  onIncreaseFontSize,
  onDecreaseFontSize,
}) => {
  const FONT_CONTROL_BUTTON_CLASS = "bg-lime-custom text-purple-custom px-2 py-1 rounded-md text-xs font-bold hover:bg-lime-400";
  
  return (
    <div className="bg-purple-custom text-white p-4 mb-6 shadow-lg rounded-md">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <div className="flex items-center">
          {logoSrc && <img src={logoSrc} alt="Logo" className="h-12 sm:h-16 mr-3 sm:mr-4 object-contain" />}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">ANÁLISE CRÍTICA DE RESULTADOS ANALÍTICOS - CROMATOGRAFIA</h1>
        </div>
        <div className="group flex items-center space-x-2 sm:space-x-3"> {/* Parent hover group */}
          <div className="flex items-center space-x-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300"> {/* Font controls container */}
            <button 
              onClick={onDecreaseFontSize} 
              title="Diminuir Fonte" 
              className={FONT_CONTROL_BUTTON_CLASS}
              aria-label="Diminuir tamanho da fonte"
            >
              A-
            </button>
            <span className="text-xs w-10 text-center" aria-live="polite">{currentFontSizePercentage}%</span>
            <button 
              onClick={onIncreaseFontSize} 
              title="Aumentar Fonte" 
              className={FONT_CONTROL_BUTTON_CLASS}
              aria-label="Aumentar tamanho da fonte"
            >
              A+
            </button>
          </div>
          <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300"> {/* Logo button container with hover effect */}
            <label 
              htmlFor="logo-upload" 
              className="cursor-pointer bg-lime-custom text-purple-custom px-3 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-lime-400 whitespace-nowrap"
              role="button"
              aria-controls="logo-upload"
            >
              Carregar Logo
            </label>
            <input 
              id="logo-upload" 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={onLogoUpload} 
              aria-label="Carregar arquivo de logo"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="numeroUnicoRastreabilidade" className={`${LABEL_CLASS} text-white`}>Nº Rastreabilidade:</label>
          <input
            type="text"
            id="numeroUnicoRastreabilidade"
            value={numeroUnicoRastreabilidade}
            onChange={(e) => onNumeroUnicoRastreabilidadeChange(e.target.value)}
            className={`${INPUT_CLASS} text-gray-800`}
            aria-label="Número Único de Rastreabilidade"
          />
        </div>
        <div>
          <label htmlFor="dataRealizacaoAnaliseCritica" className={`${LABEL_CLASS} text-white`}>Data Análise Crítica:</label>
          <input
            type="date"
            id="dataRealizacaoAnaliseCritica"
            value={dataRealizacaoAnaliseCritica}
            onChange={(e) => onDataRealizacaoAnaliseCriticaChange(e.target.value)}
            className={`${INPUT_CLASS} text-gray-800`}
            aria-label="Data da Realização da Análise Crítica"
          />
        </div>
        <div>
          <label htmlFor="revisaoAnaliseCritica" className={`${LABEL_CLASS} text-white`}>Revisão Análise Crítica:</label>
          <input
            type="text"
            id="revisaoAnaliseCritica"
            value={revisaoAnaliseCritica}
            onChange={(e) => onRevisaoAnaliseCriticaChange(e.target.value)}
            className={`${INPUT_CLASS} text-gray-800`}
            aria-label="Revisão da Análise Crítica"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
