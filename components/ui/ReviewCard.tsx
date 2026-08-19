import { ReviewOpen } from "@/components/ui/ReviewOpen";
import { formatReviewDate, type Review } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`Оценка ${rating} из 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 14 14"
          aria-hidden="true"
          className="size-3.5"
        >
          <path
            d="m7 1.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2 3.6 12l.7-3.8L1.5 5.5l3.8-.5z"
            fill={
              star <= rating
                ? "var(--color-accent)"
                : "var(--color-line-strong)"
            }
          />
        </svg>
      ))}
    </span>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <ReviewOpen
      review={review}
      className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-6 transition-colors duration-500 hover:border-line-strong lg:p-7"
    >
      <div className="flex items-center justify-between gap-4">
        <Stars rating={review.rating} />
        <time
          dateTime={review.date}
          className="readout text-[11px] whitespace-nowrap text-faint"
        >
          {formatReviewDate(review.date)}
        </time>
      </div>

      <blockquote className="flex-1 text-[14px] leading-relaxed text-muted">
        {review.text}
      </blockquote>

      <p className="text-[13px] font-medium text-ink">{review.name}</p>
    </ReviewOpen>
  );
}
