import { useState, useEffect, useRef } from 'react'
import { Search, Loader, CheckCircle, XCircle, Download, Share2, Copy, ExternalLink } from 'lucide-react'
import QRCode from 'qrcode.react'
import toast from 'react-hot-toast'
import { verifyCertificate } from '../utils/contract'

export default function VerifyCertificate({ selectedHash = null, onHashUsed = null }) {
  const [certificateHash, setCertificateHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [isCopied, setIsCopied] = useState(false)
  const qrCodeRef = useRef()

  // Auto-populate hash when selectedHash prop changes
  useEffect(() => {
    if (selectedHash) {
      setCertificateHash(selectedHash)
      // Automatically verify the selected certificate
      handleVerify(null, selectedHash)
      // Notify parent that we've used the hash
      onHashUsed?.()
    }
  }, [selectedHash, onHashUsed])

  // Read hash from URL query parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hashParam = params.get('hash')
    if (hashParam && !certificateHash) {
      setCertificateHash(hashParam)
      handleVerify(null, hashParam)
    }
  }, [])

  const handleVerify = async (e, hash = null) => {
    // Allow both form submission and programmatic calls
    if (e) {
      e.preventDefault()
    }

    const hashToVerify = hash || certificateHash

    if (!hashToVerify.trim()) {
      toast.error('Please enter a certificate hash')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const verificationResult = await verifyCertificate(hashToVerify)
      setResult(verificationResult)

      if (verificationResult.exists) {
        toast.success('Certificate verified successfully!')
      } else {
        toast.error('Certificate not found')
      }
    } catch (error) {
      console.error('Error verifying certificate:', error)
      toast.error(error.message || 'Error verifying certificate')
      setResult({
        exists: false,
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateHash = async () => {
    // Simple SHA256 hash simulation (in production, use crypto library)
    const text = `${Date.now()}-${Math.random()}`
    const hash = await hashString(text)
    setCertificateHash(hash)
    toast.success('Sample hash generated!')
  }

  // Simple hash function (not cryptographically secure, for demo purposes)
  const hashString = async (str) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return '0x' + hashHex
  }

  // Download QR code as PNG
  const handleDownloadQR = () => {
    try {
      if (!qrCodeRef.current) {
        toast.error('QR code not found')
        return
      }

      // Get the canvas element from the QR code component
      const canvas = qrCodeRef.current.querySelector('canvas')
      if (!canvas) {
        toast.error('Could not find QR code canvas')
        return
      }

      // Convert canvas to image data URL
      const image = canvas.toDataURL('image/png')

      // Create a download link and trigger download
      const link = document.createElement('a')
      link.href = image
      link.download = `certificate-${certificateHash.slice(0, 8)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('QR code downloaded successfully!')
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast.error('Failed to download QR code')
    }
  }

  // Share certificate with verification URL
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?hash=${certificateHash}`
      
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: 'Certificate Verification',
          text: 'Verify this certificate on CertiChain',
          url: shareUrl,
        })
        toast.success('Certificate shared!')
      } else {
        // Fallback: Copy share URL to clipboard
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Share URL copied to clipboard!')
      }
    } catch (error) {
      // User cancelled share dialog (not an error)
      if (error.name !== 'AbortError') {
        console.error('Error sharing certificate:', error)
        toast.error('Failed to share certificate')
      }
    }
  }

  // Copy certificate hash to clipboard
  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(certificateHash)
      setIsCopied(true)
      toast.success('Hash copied to clipboard!')
      
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Error copying hash:', error)
      toast.error('Failed to copy hash')
    }
  }

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="heading-md mb-2">Verify Certificate</h2>
        <p className="text-muted">Enter the certificate hash to verify its authenticity on the blockchain</p>
      </div>

      {/* Verify Form Card */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={certificateHash}
              onChange={(e) => setCertificateHash(e.target.value)}
              placeholder="Enter certificate hash (0x742d35Cc6634C0532925a3b...)"
              disabled={isLoading}
              className="input-premium flex-1"
            />

            <button
              type="submit"
              disabled={isLoading || !certificateHash.trim()}
              className="btn-primary px-8 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="spinner" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>

          {/* Helper Buttons */}
          <button
            type="button"
            onClick={handleGenerateHash}
            className="btn-secondary-sm text-sm px-4 py-2"
          >
            💡 Generate Sample Hash
          </button>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {result.exists ? (
            // Valid Certificate Card
            <div className="glass-card border-l-4 border-emerald-500 p-8 rounded-2xl">
              {/* Header */}
              <div className="flex items-start gap-4 mb-8 pb-6 border-b border-white/20 dark:border-slate-700/30">
                <div className="text-4xl">✅</div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    Certificate Verified
                  </h3>
                  <p className="text-muted">This certificate is valid and stored on the blockchain</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Certificate Details */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Student Name */}
                  <div className="glass-card-sm p-4 rounded-xl">
                    <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
                      Student Name
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {result.studentName || '—'}
                    </p>
                  </div>

                  {/* Course */}
                  <div className="glass-card-sm p-4 rounded-xl">
                    <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
                      Course
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {result.courseName || '—'}
                    </p>
                  </div>

                  {/* Issue Date */}
                  <div className="glass-card-sm p-4 rounded-xl">
                    <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
                      Issue Date
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {result.issueDate || '—'}
                    </p>
                  </div>

                  {/* Blockchain Badge */}
                  <div className="badge-success p-4 rounded-xl">
                    <span className="text-lg">🔗</span>
                    <div>
                      <p className="font-bold">Blockchain Verified</p>
                      <p className="text-xs opacity-75">Immutable and permanent</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="glass-card-sm p-4 rounded-xl flex flex-col items-center justify-center">
                  <p className="text-xs font-semibold text-muted mb-4 uppercase tracking-wide">
                    QR Code
                  </p>
                  <div ref={qrCodeRef} className="mb-4">
                    <QRCode
                      value={certificateHash}
                      size={200}
                      level="H"
                      includeMargin={true}
                      bgColor={
                        document.documentElement.classList.contains('dark')
                          ? '#1e293b'
                          : '#ffffff'
                      }
                      fgColor={
                        document.documentElement.classList.contains('dark')
                          ? '#ffffff'
                          : '#000000'
                      }
                    />
                  </div>

                  {/* QR Code Actions */}
                  <div className="w-full grid grid-cols-3 gap-2">
                    <button
                      onClick={handleDownloadQR}
                      className="btn-secondary-sm text-xs py-2 flex flex-col items-center gap-1"
                      title="Download QR code as PNG"
                    >
                      <Download size={16} />
                      <span className="hidden sm:inline">DL</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="btn-secondary-sm text-xs py-2 flex flex-col items-center gap-1"
                      title="Share verification link"
                    >
                      <Share2 size={16} />
                      <span className="hidden sm:inline">Share</span>
                    </button>

                    <button
                      onClick={handleCopyHash}
                      className={`text-xs py-2 flex flex-col items-center gap-1 rounded-lg transition-all ${
                        isCopied
                          ? 'badge-success'
                          : 'btn-secondary-sm'
                      }`}
                      title="Copy hash to clipboard"
                    >
                      <Copy size={16} />
                      <span className="hidden sm:inline">
                        {isCopied ? '✓' : 'Copy'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Invalid Certificate Card
            <div className="glass-card border-l-4 border-red-500 p-8 rounded-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">❌</div>
                <div>
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                    Invalid Certificate
                  </h3>
                  <p className="text-muted">
                    {result.error || 'This certificate could not be verified on the blockchain'}
                  </p>
                </div>
              </div>

              <div className="glass-card-sm p-4 rounded-xl">
                <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
                  Hash Submitted
                </p>
                <p className="font-mono text-sm text-slate-900 dark:text-white break-all">
                  {certificateHash}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !isLoading && (
        <div className="glass-card p-12 rounded-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-6">
            <Search size={40} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-lg text-muted mb-2">Ready to verify?</p>
          <p className="text-sm text-muted">Enter a certificate hash above to check its authenticity</p>
        </div>
      )}
    </section>
  )
}
