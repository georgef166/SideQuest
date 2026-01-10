'use client';

import React from 'react';

interface ProfileCardProps {
  icon: string;
  label: string;
  value?: string | string[];
  isEmpty?: boolean;
  emptyText?: string;
  onClick?: () => void;
  isEditable?: boolean;
  children?: React.ReactNode;
}

export function ProfileCard({
  icon,
  label,
  value,
  isEmpty,
  emptyText = 'Not specified',
  onClick,
  isEditable,
  children,
}: ProfileCardProps) {
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  const showEmpty = isEmpty !== false && (!displayValue || (Array.isArray(value) && value.length === 0));

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-6
        ${isEditable && onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-sm' : ''}
        transition-all
      `}
      onClick={onClick}
      role={isEditable ? 'button' : undefined}
      tabIndex={isEditable ? 0 : undefined}
      onKeyDown={isEditable && onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children ? (
        children
      ) : (
        <>
          <div className="flex items-start gap-4">
            <div className="text-2xl">{icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-600 mb-1">{label}</h3>
              {showEmpty ? (
                <p className="text-sm text-gray-400">{emptyText}</p>
              ) : (
                <p className="text-sm text-gray-800 break-words">{displayValue}</p>
              )}
            </div>
            {isEditable && <span className="text-gray-300 flex-shrink-0">→</span>}
          </div>
        </>
      )}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

interface ProfileCompletionCardProps {
  percentage: number;
  incompleteFields: string[];
}

export function ProfileCompletionCard({
  percentage,
  incompleteFields,
}: ProfileCompletionCardProps) {
  if (percentage === 100) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h3 className="text-base font-semibold text-blue-900 mb-2">
        Complete your profile
      </h3>
      <p className="text-sm text-blue-800 mb-4">
        You are {percentage}% done! Just {100 - percentage}% more to unlock better recommendations.
      </p>

      <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="space-y-2">
        {incompleteFields.map((field, idx) => (
          <p key={idx} className="text-sm text-blue-700">
            • {field}
          </p>
        ))}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-base font-medium text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface CheckboxGroupProps {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

export function CheckboxGroup({ options, selected, onChange, disabled }: CheckboxGroupProps) {
  const toggleOption = (value: string) => {
    const updated = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => toggleOption(option.value)}
            disabled={disabled}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

interface RadioGroupProps {
  options: Array<{ value: string; label: string }>;
  selected?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RadioGroup({ options, selected, onChange, disabled }: RadioGroupProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="radio-group"
            checked={selected === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 cursor-pointer"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

interface PillSelectProps {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

export function PillSelect({ options, selected, onChange, disabled }: PillSelectProps) {
  const togglePill = (value: string) => {
    const updated = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(updated);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => togglePill(option.value)}
          disabled={disabled}
          className={`
            px-3 py-2 rounded-full text-sm font-medium transition-colors
            ${
              selected.includes(option.value)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
