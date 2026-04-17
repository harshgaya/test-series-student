import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: "IIT NEET — India's #1 Test Series Platform",
  description: "Practice MCQs, attempt mock tests, and crack NEET & JEE with India's most trusted test series. 50,000+ questions, All India Rank, video solutions.",
  keywords: 'NEET mock test, JEE mock test, NEET preparation, EAMCET test series',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Sora:wght@700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 500 },
            success: { style: { background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' } },
            error:   { style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' } },
          }}
        />
      </body>
    </html>
  )
}
