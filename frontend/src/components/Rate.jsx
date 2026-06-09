import { Star } from 'lucide-react';

function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getFillAmount(value, index) {
  return clampValue(value - index, 0, 1);
}

export default function Rate(props) {
  const { value = 0, max = 5, className = '', showValue = false } = props;
  const normalizedValue = clampValue(Number(value) || 0, 0, max);
  const stars = Array.from({ length: max });

  return (
    <div className={className} aria-label={`评分 ${normalizedValue.toFixed(1)} 分`}>
      <div className='inline-flex items-center gap-[4pt]'>
        {stars.map(function mapStar(_, index) {
          const fillAmount = getFillAmount(normalizedValue, index);

          return (
            <span className='relative inline-flex h-[12pt] w-[12pt] items-center justify-center' key={index}>
              <Star className='h-[12pt] w-[12pt] text-[#e8e6dc]' strokeWidth={1.7} />
              {fillAmount > 0 ? (
                <span
                  className='absolute inset-y-0 left-0 overflow-hidden'
                  style={{
                    width: `${fillAmount * 100}%`,
                  }}
                >
                  <Star className='h-[12pt] w-[12pt] text-[#c8a24a]' fill='currentColor' strokeWidth={1.7} />
                </span>
              ) : null}
            </span>
          );
        })}
        {showValue ? <span className='ml-[2pt] text-[10pt] font-medium tabular-nums text-[#7d6d3f]'>{normalizedValue.toFixed(1)}</span> : null}
      </div>
    </div>
  );
}
