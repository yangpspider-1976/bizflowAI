'use client'

export default function ReportStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @media print {
        .no-print { display: none !important; }
        body { background: white; }
        #report-content { box-shadow: none; margin: 0; padding: 2cm; border-radius: 0; }
      }
      .prose-report h1 { font-size: 1.8em; font-weight: 700; margin-bottom: 0.5em; color: #1e3a8a; }
      .prose-report h2 { font-size: 1.3em; font-weight: 600; margin-top: 2em; margin-bottom: 0.5em; color: #1e40af; border-bottom: 2px solid #dbeafe; padding-bottom: 0.25em; }
      .prose-report h3 { font-size: 1.1em; font-weight: 600; margin-top: 1em; color: #1d4ed8; }
      .prose-report p { margin-bottom: 0.75em; line-height: 1.7; }
      .prose-report ul { margin-left: 1.5em; margin-bottom: 0.75em; }
      .prose-report li { margin-bottom: 0.25em; }
      .prose-report strong { color: #1e3a8a; }
    ` }} />
  )
}
