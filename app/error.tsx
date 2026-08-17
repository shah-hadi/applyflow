"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main className="error-page"><span>Something went wrong</span><h1>ApplyFlow couldn’t load this page.</h1><p>Your data is safe. Try loading the workspace again.</p><button className="primary" onClick={reset}>Try again</button></main>;
}
