interface BrandMarkProps {
  size?: number;
  title?: string;
}

/** Sprout over a ground line: the product mark. */
const BrandMark = ({ size = 32, title }: BrandMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
  >
    <path d="M16 26V15" stroke="#3fb950" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M16 17c0-4.4 3-7 7.5-7 0 4.4-3 7-7.5 7Z" fill="#3fb950" />
    <path d="M16 20c0-3.6-2.4-5.8-6.2-5.8 0 3.6 2.4 5.8 6.2 5.8Z" fill="#2ea043" />
    <path d="M8 26h16" stroke="#e6edf3" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export default BrandMark;
