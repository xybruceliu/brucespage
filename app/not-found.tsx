import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-foreground text-9xl font-medium">404</h1>
      <p className="text-muted-foreground">
        This page doesn&apos;t exist.{' '}
        <Link href="/" className="text-foreground underline underline-offset-2">
          Back home
        </Link>
      </p>
    </div>
  )
}
