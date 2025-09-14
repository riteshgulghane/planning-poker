import React from 'react';
import { FIBONACCI_SCALE } from 'shared';

interface VotingCardProps {
  value: number | null;
  isSelected: boolean;
  isRevealed: boolean;
  onSelect: (value: number | null) => void;
  disabled?: boolean;
}

export const VotingCard: React.FC<VotingCardProps> = ({
  value,
  isSelected,
  isRevealed,
  onSelect,
  disabled = false,
}) => {
  const displayValue = value === null ? '?' : value.toString();
  
  const handleClick = () => {
    if (!disabled) {
      onSelect(value);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        vote-card
        ${isSelected ? 'selected' : ''}
        ${isRevealed ? 'revealed' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {displayValue}
    </button>
  );
};

interface VotingCardSetProps {
  selectedValue: number | null;
  onSelect: (value: number | null) => void;
  disabled?: boolean;
  isRevealed?: boolean;
}

export const VotingCardSet: React.FC<VotingCardSetProps> = ({
  selectedValue,
  onSelect,
  disabled = false,
  isRevealed = false,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {FIBONACCI_SCALE.map((value, index) => (
        <VotingCard
          key={index}
          value={value}
          isSelected={selectedValue === value}
          isRevealed={isRevealed}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
