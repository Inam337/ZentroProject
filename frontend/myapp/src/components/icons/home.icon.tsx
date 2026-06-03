import { memo } from 'react';

const HomeIcon = memo(function HomeIcon(props: {
  width?: number;
  height?: number;
  className?: string;
  fill?: string;
}) {
  const { width = 24, height = 24, className = '', fill = '#3C7062' } = props;

  return (
    <div className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.0003 8.71001L13.6673 4.56201C12.7045 3.81299
          11.3561 3.81299 10.3933 4.56201L5.05927
          8.71001C4.40968 9.21518 4.02989 9.99211
          4.03027 10.815V18.015C4.03027 19.1196
          4.9257 20.015 6.03027 20.015H18.0303C19.1348
          20.015 20.0303 19.1196 20.0303 18.015V10.815C20.0303
          9.99201 19.6503 9.21501 19.0003 8.71001"
          stroke={fill}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 14.9999C13.79 16.3329 10.208 16.3329 8 14.9999"
          stroke={fill}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

export { HomeIcon };
