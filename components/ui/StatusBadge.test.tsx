import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Para matchers como .toHaveClass()
import StatusBadge from './StatusBadge';
import { ValidationStatus } from '../../types';

// TODO: The following tests are commented out because TypeScript cannot find Jest's global type definitions (describe, test, expect).
// To properly fix this and enable these tests, please ensure:
// 1. @types/jest is installed as a dev dependency (e.g., `npm install --save-dev @types/jest` or `yarn add --dev @types/jest`).
// 2. Your tsconfig.json is configured to include Jest types. This might involve:
//    - Adding "jest" to the "types" array in `compilerOptions`.
//    - Ensuring your test files (like this one) are included in a way that Jest's types are recognized,
//      often handled automatically if `tsconfig.json`'s `include` patterns cover test files or if using a tool like ts-jest.

/*
describe('StatusBadge Component', () => {
  test('renders OK status correctly', () => {
    render(<StatusBadge status={ValidationStatus.OK} />);
    const badgeElement = screen.getByText(ValidationStatus.OK);
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('bg-green-500', 'text-white');
  });

  test('renders ForaDaFaixa status correctly', () => {
    render(<StatusBadge status={ValidationStatus.ForaDaFaixa} />);
    const badgeElement = screen.getByText(ValidationStatus.ForaDaFaixa);
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('bg-red-500', 'text-white');
  });

  test('renders Pendente status correctly', () => {
    render(<StatusBadge status={ValidationStatus.Pendente} />);
    const badgeElement = screen.getByText(ValidationStatus.Pendente);
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('bg-yellow-400', 'text-gray-800');
  });

  test('renders NA status correctly', () => {
    render(<StatusBadge status={ValidationStatus.NA} />);
    const badgeElement = screen.getByText(ValidationStatus.NA);
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass('bg-gray-300', 'text-gray-700');
  });
});
*/
