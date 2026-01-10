'use client';

import { Range, getTrackBackground } from 'react-range';

interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function DualRangeSlider({ min, max, value, onChange }: DualRangeSliderProps) {
  return (
    <div className="px-2">
      <Range
        values={value}
        step={1}
        min={min}
        max={max}
        onChange={(values) => onChange(values as [number, number])}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
              height: '36px',
              display: 'flex',
              width: '100%',
            }}
          >
            <div
              ref={props.ref}
              style={{
                height: '8px',
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values: value,
                  colors: ['#e5e7eb', '#3b82f6', '#e5e7eb'],
                  min: min,
                  max: max,
                }),
                alignSelf: 'center',
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ index, props }) => {
          const { key, ...restProps } = props;
          return (
            <div
              key={key}
              {...restProps}
              style={{
                ...restProps.style,
                height: '20px',
                width: '20px',
                borderRadius: '50%',
                backgroundColor: index === 0 ? '#3b82f6' : '#6366f1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                border: '2px solid white',
              }}
            />
          );
        }}
      />
    </div>
  );
}
