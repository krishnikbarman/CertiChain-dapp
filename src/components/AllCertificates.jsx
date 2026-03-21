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
    <section className="py-8 px-4 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen size={28} />
            All Certificates
          </h2>
          <button
            onClick={fetchAllCertificates}
            disabled={isLoading}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 text-white rounded-lg transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>

        {/* Certificate Count Badge */}
        {certificateCount > 0 && (
          <div className="mb-6 inline-block bg-sky-100 dark:bg-sky-900/30 text-sky-900 dark:text-sky-100 px-4 py-2 rounded-lg font-medium">
            Total Certificates: {certificateCount}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-amber-800 dark:text-amber-200">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader size={48} className="animate-spin text-sky-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading certificates...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && certificates.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <BookOpen size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No certificates have been added yet
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
              Certificates will appear here as they are added to the blockchain
            </p>
          </div>
        )}

        {/* Certificates Table/List */}
        {!isLoading && certificates.length > 0 && (
          <div className="overflow-x-auto">
            <div className="hidden md:block">
              {/* Desktop Table View */}
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-700">
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Issue Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Certificate Hash
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert, index) => (
                    <tr
                      key={cert.hash}
                      onClick={() => handleCertificateClick(cert.hash)}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition cursor-pointer group"
                    >
                      <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                        {cert.studentName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {cert.courseName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {cert.issueDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded text-xs font-mono break-all">
                            {cert.hash.substring(0, 10)}...{cert.hash.substring(cert.hash.length - 8)}
                          </code>
                          <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition text-sky-500" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {certificates.map((cert) => (
                <div
                  key={cert.hash}
                  onClick={() => handleCertificateClick(cert.hash)}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-lg transition cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-700/50"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                          Student
                        </p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                          {cert.studentName}
                        </p>
                      </div>
                      <ExternalLink size={18} className="text-sky-500 flex-shrink-0 mt-1" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Course
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        {cert.courseName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Issue Date
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        {cert.issueDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Hash
                      </p>
                      <code className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded text-xs font-mono block break-all">
                        {cert.hash}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
