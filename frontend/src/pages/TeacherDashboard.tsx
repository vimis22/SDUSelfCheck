import { useEffect, useState } from 'react'

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

type EditGradeForm = {
    gradeValue: string
    ectsGrade: string
    passed: boolean
    feedback: string
}

const TeacherDashboard = () => {
    const teacherId = 1

    const [gradeResults, setGradeResults] = useState<GradeResult[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [editingGrade, setEditingGrade] = useState<GradeResult | null>(null)
    const [editForm, setEditForm] = useState<EditGradeForm>({
        gradeValue: '',
        ectsGrade: '',
        passed: true,
        feedback: '',
    })

    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchGradeResults()
    }, [])

    const fetchGradeResults = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`http://localhost:8081/api/grade-results/teacher/${teacherId}`)

            if (!response.ok) {
                throw new Error('Kunne ikke hente karakterer.')
            }

            const data = await response.json()
            setGradeResults(data)
        } catch {
            setError('Der skete en fejl ved hentning af karakterer.')
        } finally {
            setLoading(false)
        }
    }

    const startEdit = (gradeResult: GradeResult) => {
        setEditingGrade(gradeResult)

        setEditForm({
            gradeValue: gradeResult.gradeValue ?? '',
            ectsGrade: gradeResult.ectsGrade ?? '',
            passed: gradeResult.passed,
            feedback: gradeResult.feedback ?? '',
        })
    }

    const cancelEdit = () => {
        setEditingGrade(null)
        setEditForm({
            gradeValue: '',
            ectsGrade: '',
            passed: true,
            feedback: '',
        })
    }

    const saveEdit = async () => {
        if (!editingGrade) {
            return
        }

        try {
            setSaving(true)
            setError(null)

            const body = {
                examRegistrationId: editingGrade.examRegistrationId,
                teacherId: editingGrade.teacherId ?? teacherId,
                gradeValue: editForm.gradeValue,
                ectsGrade: editForm.ectsGrade,
                passed: editForm.passed,
                feedback: editForm.feedback,
            }

            const response = await fetch(
                `http://localhost:8081/api/grade-results/${editingGrade.gradeResultId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                }
            )

            if (!response.ok) {
                throw new Error('Kunne ikke gemme karakter.')
            }

            cancelEdit()
            await fetchGradeResults()
        } catch {
            setError('Der skete en fejl ved gemning af karakter.')
        } finally {
            setSaving(false)
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

    const getStudentName = (gradeResult: GradeResult) => {
        if (gradeResult.studentFirstName || gradeResult.studentLastName) {
            return `${gradeResult.studentFirstName ?? ''} ${gradeResult.studentLastName ?? ''}`.trim()
        }

        return '-'
    }

    const formatPassed = (passed: boolean) => {
        return passed ? 'Bestået' : 'Ikke bestået'
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>Teacher Dashboard</h1>
                <p style={styles.subtitle}>
                    Her kan underviseren se og administrere karakterer.
                </p>
            </div>

            <section style={styles.card}>
                <div style={styles.cardHeader}>
                    <div>
                        <h2 style={styles.cardTitle}>Mine karakterer</h2>
                        <p style={styles.cardSubtitle}>
                            Oversigt over karakterer givet af underviser #{teacherId}.
                        </p>
                    </div>

                    <button onClick={fetchGradeResults} style={styles.refreshButton}>
                        Opdater
                    </button>
                </div>

                {loading && (
                    <p style={styles.infoText}>Henter karakterer...</p>
                )}

                {error && (
                    <p style={styles.errorText}>{error}</p>
                )}

                {!loading && !error && gradeResults.length === 0 && (
                    <p style={styles.infoText}>Ingen karakterer fundet.</p>
                )}

                {!loading && !error && gradeResults.length > 0 && (
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Student</th>
                                <th style={styles.th}>Studienummer</th>
                                <th style={styles.th}>Kursus</th>
                                <th style={styles.th}>Eksamen</th>
                                <th style={styles.th}>Karakter</th>
                                <th style={styles.th}>ECTS</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Feedback</th>
                                <th style={styles.th}>Bedømt</th>
                                <th style={styles.th}>Handling</th>
                            </tr>
                            </thead>

                            <tbody>
                            {gradeResults.map((gradeResult) => (
                                <tr key={gradeResult.gradeResultId}>
                                    <td style={styles.td}>{gradeResult.gradeResultId}</td>
                                    <td style={styles.td}>{getStudentName(gradeResult)}</td>
                                    <td style={styles.td}>{gradeResult.studentNumber ?? '-'}</td>
                                    <td style={styles.td}>{gradeResult.courseName ?? '-'}</td>
                                    <td style={styles.td}>{gradeResult.examTitle ?? '-'}</td>
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
                                    <td style={styles.td}>{gradeResult.feedback ?? '-'}</td>
                                    <td style={styles.td}>{formatDate(gradeResult.gradedAt)}</td>
                                    <td style={styles.td}>
                                        <button
                                            onClick={() => startEdit(gradeResult)}
                                            style={styles.editButton}
                                        >
                                            Ret
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {editingGrade && (
                <section style={styles.editCard}>
                    <h2 style={styles.cardTitle}>Ret karakter</h2>

                    <p style={styles.cardSubtitle}>
                        Retter karakter for {getStudentName(editingGrade)} i {editingGrade.courseName}.
                    </p>

                    <div style={styles.formGrid}>
                        <label style={styles.label}>
                            Karakter
                            <input
                                value={editForm.gradeValue}
                                onChange={(event) =>
                                    setEditForm({ ...editForm, gradeValue: event.target.value })
                                }
                                style={styles.input}
                            />
                        </label>

                        <label style={styles.label}>
                            ECTS grade
                            <input
                                value={editForm.ectsGrade}
                                onChange={(event) =>
                                    setEditForm({ ...editForm, ectsGrade: event.target.value })
                                }
                                style={styles.input}
                            />
                        </label>

                        <label style={styles.label}>
                            Status
                            <select
                                value={editForm.passed ? 'true' : 'false'}
                                onChange={(event) =>
                                    setEditForm({
                                        ...editForm,
                                        passed: event.target.value === 'true',
                                    })
                                }
                                style={styles.input}
                            >
                                <option value="true">Bestået</option>
                                <option value="false">Ikke bestået</option>
                            </select>
                        </label>
                    </div>

                    <label style={styles.label}>
                        Feedback
                        <textarea
                            value={editForm.feedback}
                            onChange={(event) =>
                                setEditForm({ ...editForm, feedback: event.target.value })
                            }
                            style={styles.textarea}
                        />
                    </label>

                    <div style={styles.editActions}>
                        <button onClick={saveEdit} disabled={saving} style={styles.saveButton}>
                            {saving ? 'Gemmer...' : 'Gem ændring'}
                        </button>

                        <button onClick={cancelEdit} style={styles.cancelButton}>
                            Annuller
                        </button>
                    </div>
                </section>
            )}
        </div>
    )
}

const styles: { [key: string]: React.CSSProperties } = {
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
    editCard: {
        marginTop: '24px',
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
    editButton: {
        backgroundColor: '#ffffff',
        color: '#2f472c',
        border: '1px solid #2f472c',
        borderRadius: '8px',
        padding: '8px 12px',
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
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginTop: '20px',
        marginBottom: '16px',
    },
    label: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontWeight: 700,
        color: '#374151',
    },
    input: {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '14px',
    },
    textarea: {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '14px',
        minHeight: '100px',
        resize: 'vertical',
    },
    editActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '18px',
    },
    saveButton: {
        backgroundColor: '#2f472c',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        fontWeight: 700,
        cursor: 'pointer',
    },
    cancelButton: {
        backgroundColor: '#ffffff',
        color: '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '10px 16px',
        fontWeight: 700,
        cursor: 'pointer',
    },
}

export default TeacherDashboard