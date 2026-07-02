import { useEffect, useState, type CSSProperties } from 'react'
import { useAuth } from '../auth/AuthContext.tsx'

type ReexamStatus = 'idle' | 'loading' | 'done' | 'error'

type GradeResult = {
    gradeResultId: number
    examRegistrationId: number

    studentId?: number
    studentNumber?: string
    studentFirstName?: string
    studentLastName?: string

    examId?: number
    examTitle?: string
    examType?: string
    examDate?: string

    courseId?: number
    courseCode?: string
    courseName?: string

    teacherId?: number
    teacherEmployeeNumber?: string
    teacherFirstName?: string
    teacherLastName?: string

    gradeValue: string
    ectsGrade?: string
    passed: boolean
    feedback?: string
    gradedAt?: string
}

const ResultsPage = () => {
    const { user } = useAuth()
    const studentId = user?.studentId ?? null

    const [gradeResults, setGradeResults] = useState<GradeResult[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reexamStatus, setReexamStatus] = useState<Record<number, ReexamStatus>>({})
    const [reexamError, setReexamError] = useState<Record<number, string>>({})

    useEffect(() => {
        if (studentId != null) fetchGradeResults()
    }, [studentId])

    const fetchGradeResults = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`http://localhost:8081/api/grade-results/student/${studentId}`)

            if (!response.ok) {
                throw new Error('Kunne ikke hente resultater.')
            }

            const data = await response.json()
            setGradeResults(data)
        } catch {
            setError('Der skete en fejl ved hentning af resultater.')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (value?: string) => {
        if (!value) {
            return '-'
        }

        return new Date(value).toLocaleString('da-DK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatPassed = (passed: boolean) => {
        return passed ? 'Bestået' : 'Ikke bestået'
    }

    const handleReexam = async (gradeResult: GradeResult) => {
        const id = gradeResult.gradeResultId

        if (!gradeResult.examId) {
            console.error('[ResultsPage] handleReexam: examId mangler på gradeResult', gradeResult)
            setReexamError(prev => ({ ...prev, [id]: 'Eksamen-ID mangler. Kontakt administrator.' }))
            setReexamStatus(prev => ({ ...prev, [id]: 'error' }))
            return
        }
        if (studentId == null) {
            setReexamError(prev => ({ ...prev, [id]: 'Student ID mangler. Log ind igen.' }))
            setReexamStatus(prev => ({ ...prev, [id]: 'error' }))
            return
        }

        setReexamStatus(prev => ({ ...prev, [id]: 'loading' }))
        setReexamError(prev => ({ ...prev, [id]: '' }))

        try {
            const response = await fetch('http://localhost:8081/api/exam-registrations/reexam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, examId: gradeResult.examId }),
            })

            let responseBody: { message?: string } | null = null
            try {
                responseBody = await response.json()
            } catch {
                // non-JSON body — ignore
            }

            if (!response.ok) {
                const msg = responseBody?.message ?? `HTTP ${response.status}`
                console.error('[ResultsPage] Re-exam registrering fejlede:', response.status, responseBody)
                setReexamError(prev => ({ ...prev, [id]: `Fejl: ${msg}` }))
                setReexamStatus(prev => ({ ...prev, [id]: 'error' }))
                return
            }

            setReexamStatus(prev => ({ ...prev, [id]: 'done' }))
        } catch (e) {
            console.error('[ResultsPage] Re-exam netværksfejl:', e)
            setReexamError(prev => ({ ...prev, [id]: 'Netværksfejl. Prøv igen.' }))
            setReexamStatus(prev => ({ ...prev, [id]: 'error' }))
        }
    }

    const getTeacherName = (gradeResult: GradeResult) => {
        if (gradeResult.teacherFirstName || gradeResult.teacherLastName) {
            return `${gradeResult.teacherFirstName ?? ''} ${gradeResult.teacherLastName ?? ''}`.trim()
        }

        return '-'
    }

    if (studentId == null) {
        return (
            <div style={styles.page}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Resultater</h1>
                </div>
                <section style={styles.card}>
                    <p style={styles.errorText}>Student ID mangler. Log ud og log ind igen.</p>
                </section>
            </div>
        )
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>Resultater</h1>
                <p style={styles.subtitle}>
                    Her kan studenten se sine eksamensresultater og feedback.
                </p>
            </div>

            <section style={styles.card}>
                <div style={styles.cardHeader}>
                    <div>
                        <h2 style={styles.cardTitle}>Mine resultater</h2>
                        <p style={styles.cardSubtitle}>
                            Resultater for student #{studentId}.
                        </p>
                    </div>

                    <button onClick={fetchGradeResults} style={styles.refreshButton}>
                        Opdater
                    </button>
                </div>

                {loading && (
                    <p style={styles.infoText}>Henter resultater...</p>
                )}

                {error && (
                    <p style={styles.errorText}>{error}</p>
                )}

                {!loading && !error && gradeResults.length === 0 && (
                    <p style={styles.infoText}>Ingen resultater fundet.</p>
                )}

                {!loading && !error && gradeResults.length > 0 && (
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Kursus</th>
                                <th style={styles.th}>Kursuskode</th>
                                <th style={styles.th}>Eksamen</th>
                                <th style={styles.th}>Eksamensform</th>
                                <th style={styles.th}>Karakter</th>
                                <th style={styles.th}>ECTS</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Underviser</th>
                                <th style={styles.th}>Feedback</th>
                                <th style={styles.th}>Bedømt</th>
                                <th style={styles.th}></th>
                            </tr>
                            </thead>

                            <tbody>
                            {gradeResults.map((gradeResult) => (
                                <tr key={gradeResult.gradeResultId}>
                                    <td style={styles.td}>{gradeResult.gradeResultId}</td>
                                    <td style={styles.td}>{gradeResult.courseName ?? '-'}</td>
                                    <td style={styles.td}>{gradeResult.courseCode ?? '-'}</td>
                                    <td style={styles.td}>{gradeResult.examTitle ?? '-'}</td>
                                    <td style={styles.td}>{gradeResult.examType ?? '-'}</td>
                                    <td style={styles.td}>
                                        <strong>{gradeResult.gradeValue}</strong>
                                    </td>
                                    <td style={styles.td}>{gradeResult.ectsGrade ?? '-'}</td>
                                    <td style={styles.td}>
                                        <span
                                            style={{
                                                ...styles.statusBadge,
                                                backgroundColor: gradeResult.passed ? '#e8f3e6' : '#fde8e8',
                                                color: gradeResult.passed ? '#2f472c' : '#991b1b',
                                            }}
                                        >
                                            {formatPassed(gradeResult.passed)}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{getTeacherName(gradeResult)}</td>
                                    <td style={styles.td}>{gradeResult.feedback ?? '-'}</td>
                                    <td style={styles.td}>{formatDate(gradeResult.gradedAt)}</td>
                                    <td style={styles.td}>
                                        {!gradeResult.passed && (() => {
                                            const status = reexamStatus[gradeResult.gradeResultId]
                                            const errMsg = reexamError[gradeResult.gradeResultId]
                                            if (status === 'done') {
                                                return <span style={{ color: '#2f472c', fontWeight: 600, fontSize: '13px' }}>✓ Tilmeldt Re-Eksamen</span>
                                            }
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <button
                                                        onClick={() => handleReexam(gradeResult)}
                                                        disabled={status === 'loading'}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: status === 'error' ? '#b91c1c' : '#1e3a5f',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                                            fontSize: '13px',
                                                            fontFamily: 'inherit',
                                                            whiteSpace: 'nowrap',
                                                            opacity: status === 'loading' ? 0.6 : 1,
                                                        }}
                                                    >
                                                        {status === 'loading' ? 'Tilmelder...' : status === 'error' ? 'Prøv igen' : 'Tilmeld Re-Eksamen'}
                                                    </button>
                                                    {status === 'error' && errMsg && (
                                                        <span style={{ fontSize: '11px', color: '#b91c1c', maxWidth: '180px', lineHeight: '1.3' }}>
                                                            {errMsg}
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })()}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}

const styles: { [key: string]: CSSProperties } = {
    page: {
        padding: '32px',
        backgroundColor: '#f8f9f7',
        minHeight: '100vh',
    },
    header: {
        marginBottom: '28px',
    },
    title: {
        margin: 0,
        fontSize: '36px',
        fontWeight: 800,
        color: '#111827',
    },
    subtitle: {
        marginTop: '8px',
        fontSize: '16px',
        color: '#4b5563',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    cardTitle: {
        margin: 0,
        fontSize: '24px',
        fontWeight: 700,
    },
    cardSubtitle: {
        marginTop: '6px',
        color: '#6b7280',
    },
    refreshButton: {
        backgroundColor: '#2f472c',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        fontWeight: 700,
        cursor: 'pointer',
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        borderBottom: '1px solid #e5e7eb',
        color: '#6b7280',
        fontWeight: 700,
        whiteSpace: 'nowrap',
    },
    td: {
        padding: '12px',
        borderBottom: '1px solid #f0f0f0',
        verticalAlign: 'top',
    },
    statusBadge: {
        display: 'inline-block',
        padding: '5px 10px',
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: '13px',
        whiteSpace: 'nowrap',
    },
    infoText: {
        color: '#6b7280',
    },
    errorText: {
        color: '#b91c1c',
        fontWeight: 600,
    },
}

export default ResultsPage