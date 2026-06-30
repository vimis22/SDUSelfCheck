import { useEffect, useState, type CSSProperties } from 'react'

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

type PendingRegistration = {
    examRegistrationId: number
    studentId: number
    studentNumber: string
    studentFirstName: string
    studentLastName: string
    examId: number
    examTitle: string
    examType: string
    examDate: string
    courseId: number
    courseCode: string
    courseName: string
    status: string
    attemptNumber: number
}

type EditGradeForm = {
    gradeValue: string
    feedback: string
}

type CreateGradeForm = {
    selectedRegistrationId: number | ''
    gradeValue: string
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
        feedback: '',
    })

    const [saving, setSaving] = useState(false)

    const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([])
    const [loadingPending, setLoadingPending] = useState(true)

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [createForm, setCreateForm] = useState<CreateGradeForm>({
        selectedRegistrationId: '',
        gradeValue: '12',
        feedback: '',
    })
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchGradeResults()
        fetchPendingRegistrations()
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

    const fetchPendingRegistrations = async () => {
        try {
            setLoadingPending(true)
            const response = await fetch('http://localhost:8081/api/exam-registrations/without-grade-result')
            if (!response.ok) throw new Error()
            const data = await response.json()
            setPendingRegistrations(data)
        } catch {
            // non-critical — silently fail
        } finally {
            setLoadingPending(false)
        }
    }

    const cancelCreate = () => {
        setShowCreateForm(false)
        setCreateForm({ selectedRegistrationId: '', gradeValue: '12', feedback: '' })
    }

    const saveCreate = async () => {
        if (!createForm.selectedRegistrationId) return

        try {
            setCreating(true)
            setError(null)

            const body = {
                examRegistrationId: createForm.selectedRegistrationId,
                teacherId,
                gradeValue: createForm.gradeValue,
                feedback: createForm.feedback,
            }

            const response = await fetch('http://localhost:8081/api/grade-results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            if (!response.ok) throw new Error('Kunne ikke oprette karakter.')

            cancelCreate()
            await fetchGradeResults()
            await fetchPendingRegistrations()
        } catch {
            setError('Der skete en fejl ved oprettelse af karakter.')
        } finally {
            setCreating(false)
        }
    }

    const startEdit = (gradeResult: GradeResult) => {
        setEditingGrade(gradeResult)

        setEditForm({
            gradeValue: gradeResult.gradeValue ?? '',
            feedback: gradeResult.feedback ?? '',
        })
    }

    const cancelEdit = () => {
        setEditingGrade(null)
        setEditForm({
            gradeValue: '',
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
                ectsGrade: calculateEctsGrade(editForm.gradeValue),
                passed: calculatePassed(editForm.gradeValue),
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

    const calculatedEctsGrade = calculateEctsGrade(editForm.gradeValue)
    const calculatedPassed = calculatePassed(editForm.gradeValue)

    const createEctsGrade = calculateEctsGrade(createForm.gradeValue)
    const createPassed = calculatePassed(createForm.gradeValue)

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

            {/* ── Eksamenstilmeldinger uden karakter ── */}
            <section style={{ ...styles.card, marginTop: '24px' }}>
                <div style={styles.cardHeader}>
                    <div>
                        <h2 style={styles.cardTitle}>Eksamenstilmeldinger uden karakter</h2>
                        <p style={styles.cardSubtitle}>
                            Tilmeldinger hvor der endnu ikke er givet en karakter.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        {!showCreateForm && pendingRegistrations.length > 0 && (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                style={styles.refreshButton}
                            >
                                Opret karakter
                            </button>
                        )}
                        <button onClick={fetchPendingRegistrations} style={styles.editButton}>
                            Opdater
                        </button>
                    </div>
                </div>

                {loadingPending && (
                    <p style={styles.infoText}>Henter tilmeldinger...</p>
                )}

                {!loadingPending && pendingRegistrations.length === 0 && (
                    <p style={styles.infoText}>Ingen eksamenstilmeldinger uden karakter fundet.</p>
                )}

                {!loadingPending && pendingRegistrations.length > 0 && !showCreateForm && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {pendingRegistrations.map((reg) => (
                            <li
                                key={reg.examRegistrationId}
                                style={{
                                    padding: '10px 0',
                                    borderBottom: '1px solid #f0f0f0',
                                    fontSize: '14px',
                                    color: '#374151',
                                }}
                            >
                                <strong>{reg.studentFirstName} {reg.studentLastName}</strong>
                                {' – '}{reg.courseName}{' – '}{reg.examTitle}
                            </li>
                        ))}
                    </ul>
                )}

                {/* ── Create form ── */}
                {showCreateForm && (
                    <div style={{ marginTop: '8px' }}>
                        <div style={styles.noticeBox}>
                            ECTS-grade og bestået-status beregnes automatisk ud fra karakteren.
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={styles.label}>
                                Eksamenstilmelding
                                <select
                                    value={createForm.selectedRegistrationId}
                                    onChange={(e) =>
                                        setCreateForm({
                                            ...createForm,
                                            selectedRegistrationId: Number(e.target.value) || '',
                                        })
                                    }
                                    style={styles.input}
                                >
                                    <option value="">Vælg eksamenstilmelding...</option>
                                    {pendingRegistrations.map((reg) => (
                                        <option key={reg.examRegistrationId} value={reg.examRegistrationId}>
                                            {reg.studentFirstName} {reg.studentLastName} – {reg.courseName} – {reg.examTitle}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div style={styles.formGrid}>
                            <label style={styles.label}>
                                Karakter
                                <select
                                    value={createForm.gradeValue}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, gradeValue: e.target.value })
                                    }
                                    style={styles.input}
                                >
                                    <option value="12">12</option>
                                    <option value="10">10</option>
                                    <option value="7">7</option>
                                    <option value="4">4</option>
                                    <option value="02">02</option>
                                    <option value="00">00</option>
                                    <option value="-3">-3</option>
                                </select>
                            </label>

                            <label style={styles.label}>
                                ECTS-grade
                                <input value={createEctsGrade} readOnly style={styles.readOnlyInput} />
                            </label>

                            <label style={styles.label}>
                                Status
                                <input value={formatPassed(createPassed)} readOnly style={styles.readOnlyInput} />
                            </label>
                        </div>

                        <label style={styles.label}>
                            Feedback
                            <textarea
                                value={createForm.feedback}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, feedback: e.target.value })
                                }
                                style={styles.textarea}
                            />
                        </label>

                        <div style={styles.editActions}>
                            <button
                                onClick={saveCreate}
                                disabled={creating || !createForm.selectedRegistrationId}
                                style={{
                                    ...styles.saveButton,
                                    opacity: !createForm.selectedRegistrationId ? 0.6 : 1,
                                    cursor: !createForm.selectedRegistrationId ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {creating ? 'Gemmer...' : 'Gem karakter'}
                            </button>

                            <button onClick={cancelCreate} style={styles.cancelButton}>
                                Annuller
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {editingGrade && (
                <section style={styles.editCard}>
                    <h2 style={styles.cardTitle}>Ret karakter</h2>

                    <p style={styles.cardSubtitle}>
                        Retter karakter for {getStudentName(editingGrade)} i {editingGrade.courseName}.
                    </p>

                    <div style={styles.noticeBox}>
                        ECTS-grade og bestået-status beregnes automatisk ud fra karakteren.
                    </div>

                    <div style={styles.formGrid}>
                        <label style={styles.label}>
                            Karakter
                            <select
                                value={editForm.gradeValue}
                                onChange={(event) =>
                                    setEditForm({ ...editForm, gradeValue: event.target.value })
                                }
                                style={styles.input}
                            >
                                <option value="12">12</option>
                                <option value="10">10</option>
                                <option value="7">7</option>
                                <option value="4">4</option>
                                <option value="02">02</option>
                                <option value="00">00</option>
                                <option value="-3">-3</option>
                            </select>
                        </label>

                        <label style={styles.label}>
                            ECTS-grade
                            <input
                                value={calculatedEctsGrade}
                                readOnly
                                style={styles.readOnlyInput}
                            />
                        </label>

                        <label style={styles.label}>
                            Status
                            <input
                                value={formatPassed(calculatedPassed)}
                                readOnly
                                style={styles.readOnlyInput}
                            />
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

const calculateEctsGrade = (gradeValue: string) => {
    switch (gradeValue) {
        case '12':
            return 'A'
        case '10':
            return 'B'
        case '7':
            return 'C'
        case '4':
            return 'D'
        case '02':
            return 'E'
        case '00':
            return 'Fx'
        case '-3':
            return 'F'
        default:
            return ''
    }
}

const calculatePassed = (gradeValue: string) => {
    return gradeValue === '12'
        || gradeValue === '10'
        || gradeValue === '7'
        || gradeValue === '4'
        || gradeValue === '02'
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
    noticeBox: {
        marginTop: '16px',
        marginBottom: '16px',
        padding: '12px 14px',
        backgroundColor: '#f0f7ee',
        border: '1px solid #d6ead2',
        borderRadius: '10px',
        color: '#2f472c',
        fontWeight: 600,
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
        backgroundColor: '#ffffff',
    },
    readOnlyInput: {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '14px',
        backgroundColor: '#f3f4f6',
        color: '#374151',
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