import Script from 'next/script'

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-PLACEHOLDER'
const hasRealTrackingId = GA_TRACKING_ID !== 'G-PLACEHOLDER'

export function Analytics() {
  if (!hasRealTrackingId) {
    return null
  }

  return (
    <>
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });`}
      </Script>
    </>
  )
}
