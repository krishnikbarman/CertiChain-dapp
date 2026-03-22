import { useState, useEffect } from 'react'
import { Loader, BookOpen, AlertCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllCertificates, getCertificateCount } from '../utils/contract'

export default function AllCertificates({ onSelectCertificate = null }) {
  const [certificates, setCertificates] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [certificateCount, setCertificateCount] = useState(0)

  // Fetch all certificates on component mount
  useEffect(() => {
    fetchAllCertificates()
  }, [])

  const fetchAllCertificates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get count
      const count = await getCertificateCount()
      setCertificateCount(count)

      // Get all certificates
      const result = await getAllCertificates()
      
      // Check if result is an error response
      if (result.error && Array.isArray(result.certificates)) {
        setError(result.error)
        setCertificates(result.certificates)
        toast.error(result.error)
      } else if (Array.isArray(result)) {
        setCertificates(result)
        if (result.length > 0) {
          toast.success(`Loaded ${result.length} certificates`)
        }
      } else {
        setError('Unexpected response format')
        setCertificates([])
      }
    } catch (err) {
      console.error('❌ Error fetching certificates:', err)
      setError(err.message || 'Failed to load certificates')
      setCertificates([])
      toast.error('Error loading certificates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCertificateClick = (hash) => {
    if (onSelectCertificate) {
      onSelectCertificate(hash)
      toast.success('Certificate selected for verification')
    }
  }

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h2 className="heading-md mb-2 flex items-center gap-3">
            <BookOpen size={32} className="text-indigo-500" />
            All Certificates
          </h2>
          <p className="text-muted">Browse all verified certificates on the blockchain</p>
        </div>
        <button
          onClick={fetchAllCertificates}
          disabled={isLoading}
          className="btn-secondary px-6 py-3 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <Loader size={20} className="spinner" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>

      {/* Certificate Count Badge */}
      {certificateCount > 0 && !isLoading && (
        <div className="badge-info mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-lg">📊</span>
          <span className="font-bold text-lg">{certificateCount} Certificate{certificateCount !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="glass-card p-4 border-l-4 border-amber-500 rounded-2xl mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card p-12 rounded-2xl text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <Loader size={48} className="spinner text-indigo-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Loading certificates...</p>
          <p className="text-muted text-sm mt-2">Retrieving data from blockchain</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && certificates.length === 0 && !error && (
        <div className="glass-card p-16 rounded-2xl text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-6">
            <BookOpen size={48} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No Certificates Yet
          </p>
          <p className="text-muted mb-4">
            Certificates will appear here as they are added to the blockchain
          </p>
        </div>
      )}

      {/* Certificates Grid */}
      {!isLoading && certificates.length > 0 && (
        <div>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20 dark:border-slate-700/30 bg-white/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                      Issue Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                      Hash
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900 dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 dark:divide-slate-700/20">
                  {certificates.map((cert, index) => (
                    <tr
                      key={cert.hash}
                      onClick={() => handleCertificateClick(cert.hash)}
                      className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300 cursor-pointer group"
                    >
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold text-sm">
                        {cert.studentName}
                      </td>
                      <td className="px-6 py-4 text-muted text-sm">
                        {cert.courseName}
                      </td>
                      <td className="px-6 py-4 text-muted text-sm">
                        {cert.issueDate}
                      </td>
                      <td className="px-6 py-4">
                        <code className="glass-card-sm px-3 py-1.5 rounded-lg text-xs font-mono text-slate-900 dark:text-white inline-block">
                          {cert.hash.substring(0, 12)}...
                        </code>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ExternalLink size={18} className="inline text-indigo-500 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden grid sm:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.hash}
                onClick={() => handleCertificateClick(cert.hash)}
                className="glass-card p-5 rounded-2xl cursor-pointer hover:scale-105 transition-all duration-300 border border-white/20 dark:border-slate-700/30 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 group"
              >
                <div className="space-y-4">
                  {/* Student Name */}
                  <div>
                    <p className="text-xs font-bold text-muted mb-1 uppercase tracking-wide">
                      Student
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white line-clamp-2">
                      {cert.studentName}
                    </p>
                  </div>

                  {/* Course */}
                  <div>
                    <p className="text-xs font-bold text-muted mb-1 uppercase tracking-wide">
                      Course
                    </p>
                    <p className="text-muted line-clamp-2">
                      {cert.courseName}
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs font-bold text-muted mb-1 uppercase tracking-wide">
                      Issue Date
                    </p>
                    <p className="text-muted">
                      {cert.issueDate}
                    </p>
                  </div>

                  {/* Hash */}
                  <div>
                    <p className="text-xs font-bold text-muted mb-2 uppercase tracking-wide">
                      Hash
                    </p>
                    <code className="glass-card-sm px-3 py-2 rounded-lg text-xs font-mono text-slate-900 dark:text-white block break-all group-hover:bg-indigo-500/20 transition-colors">
                      {cert.hash.substring(0, 16)}...
                    </code>
                  </div>

                  {/* Click to verify hint */}
                  <div className="pt-2 border-t border-white/10 dark:border-slate-700/20 text-center">
                    <p className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to verify →
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
