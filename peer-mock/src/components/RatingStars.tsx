export default function RatingStars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} out of 5`} className="text-gold">
      {"★".repeat(value)}
      <span className="text-line">{"★".repeat(5 - value)}</span>
    </span>
  );
}
