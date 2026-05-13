import { useCallback } from 'react'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import { auth, storage } from '../../../../firebaseConfig'
import { getDocuments, buildConstraints, deleteDocument, updateDocument } from '../../../../utils/firebaseHelpers'
import type { Project, UserProfile } from '../../../../types'
import type { NavigateFunction } from 'react-router-dom'

interface SubmissionModalState {
    open: boolean
    projectId: string | null
    stepNumber: number | null
    project: Project | null
}

interface DeleteSubmissionState {
    open: boolean
    project: Project | null
    stepNumber: number | null
    deleting: boolean
}

interface DashboardData {
    user: any
    userProfile: UserProfile | null
    navigate: NavigateFunction
    showAlert: (message: string, title: string) => void
    refreshProjects: (teacherId: string) => Promise<void>
    emailToResend: string
    effectiveTeacherId: string | undefined
    setShowInviteModal: (v: boolean) => void
    setInitialEmail: (v: string) => void
    setResendConfirmOpen: (v: boolean) => void
    setEmailToResend: (v: string) => void
    setSubmissionModal: (v: SubmissionModalState) => void
    deleteSubmissionState: DeleteSubmissionState
    setDeleteSubmissionState: (
        v: DeleteSubmissionState | ((prev: DeleteSubmissionState) => DeleteSubmissionState)
    ) => void
    studentsHook: { loadStudents: () => Promise<void> }
}

const STEP_NAMES: Record<number, string> = {
    1: 'Initial Research',
    2: 'Design Brief',
    3: 'Planning',
    4: 'Implementation',
    5: 'Archival Records',
}

export function useDashboardHandlers(data: DashboardData) {
    const {
        user,
        userProfile,
        navigate,
        showAlert,
        refreshProjects,
        emailToResend,
        effectiveTeacherId,
        setShowInviteModal,
        setInitialEmail,
        setResendConfirmOpen,
        setEmailToResend,
        setSubmissionModal,
        deleteSubmissionState,
        setDeleteSubmissionState,
        studentsHook,
    } = data

    const getCurrentStepName = useCallback((stepNum: number): string => {
        return STEP_NAMES[stepNum] || 'Unknown'
    }, [])

    const getCurrentStepDueDate = useCallback((project: Project): string => {
        const stepField = `step${project.current_step}_due_date` as keyof Project
        const dueDate = project[stepField] as string | undefined

        if (!dueDate) return 'N/A'

        const date = new Date(dueDate)
        const isOverdue = date < new Date()
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
        })

        return isOverdue ? `Overdue - ${formattedDate}` : `Due: ${formattedDate}`
    }, [])

    const getCurrentStepSubmissionStatus = useCallback((project: Project): string => {
        const stepField = `step${project.current_step}_status` as keyof Project
        return (project[stepField] as string) || 'Not Started'
    }, [])

    const getActionButtonText = useCallback((project: Project): string => {
        const allApproved = [1, 2, 3, 4, 5].every(
            step => project[`step${step}_status` as keyof Project] === 'Approved'
        )
        return allApproved ? 'Submit to Orbilius' : 'Email Student'
    }, [])

    const handleActionClick = useCallback((project: Project) => {
        const allApproved = [1, 2, 3, 4, 5].every(
            step => project[`step${step}_status` as keyof Project] === 'Approved'
        )

        if (allApproved) {
            showAlert('Submit to Orbilius functionality coming soon!', 'Info')
            return
        }

        const studentEmail = project.student?.email || project.email
        const studentFirstName = project.student?.first_name || project.first_name
        const currentStepStatus = project[`step${project.current_step}_status` as keyof Project] as string
        const currentStepName = STEP_NAMES[project.current_step] || 'Unknown'

        if (!studentEmail) {
            showAlert('Student email not found. Please check the project data.', 'Error')
            return
        }

        let subject: string, body: string

        if (currentStepStatus === 'Submitted') {
            subject = `Feedback on ${project.project_title} - Step ${project.current_step}`
            body = `Hello ${studentFirstName},\n\nI have reviewed your submission for Step ${project.current_step}: ${currentStepName} of your project "${project.project_title}".\n\nPlease log into the Orbilius platform to view my feedback and next steps.\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\n${userProfile?.first_name || 'Your Teacher'}`
        } else {
            subject = `Follow-up on ${project.project_title} - Step ${project.current_step}`
            body = `Hello ${studentFirstName},\n\nI wanted to follow up on your project "${project.project_title}".\n\nYou are currently on Step ${project.current_step}: ${currentStepName}.\nCurrent status: ${currentStepStatus}\n\nPlease log into the Orbilius platform to continue your work or view any feedback.\n\nIf you need any assistance, please let me know.\n\nBest regards,\n${userProfile?.first_name || 'Your Teacher'}`
        }

        window.open(`mailto:${studentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    }, [showAlert, userProfile])

    const handleEmailStudent = useCallback((studentEmail: string) => {
        window.open(`mailto:${studentEmail}`)
    }, [])

    const handleEmailProjectStudent = useCallback((project: Project) => {
        const studentEmail = project.student?.email || project.email
        const currentStepName = STEP_NAMES[project.current_step] || 'Unknown'

        if (!studentEmail) {
            showAlert('Student email not found. Please check the project data.', 'Error')
            return
        }

        const subject = `${project.project_title} - Step ${project.current_step}: ${currentStepName}`
        window.open(`mailto:${studentEmail}?subject=${encodeURIComponent(subject)}`)
    }, [showAlert])

    const handleCopyTeacherId = useCallback(() => {
        if (!user?.uid) return
        navigator.clipboard.writeText(user.uid)
        showAlert('Teacher ID copied to clipboard!', 'Success')
    }, [user, showAlert])

    const handleCopySignupLink = useCallback(() => {
        if (!user?.uid) return
        const signupLink = `${window.location.origin}/signup?teacherId=${user.uid}`
        navigator.clipboard.writeText(signupLink)
        showAlert('Signup link copied to clipboard!', 'Success')
    }, [user, showAlert])

    const handleResendInvitation = useCallback((email: string) => {
        setEmailToResend(email)
        setResendConfirmOpen(true)
    }, [setEmailToResend, setResendConfirmOpen])

    const handleConfirmResend = useCallback(() => {
        setResendConfirmOpen(false)
        setInitialEmail(emailToResend)
        setShowInviteModal(true)
    }, [setResendConfirmOpen, setInitialEmail, emailToResend, setShowInviteModal])

    const handleCloseInviteModal = useCallback(() => {
        setShowInviteModal(false)
        setInitialEmail('')
        studentsHook.loadStudents()
    }, [setShowInviteModal, setInitialEmail, studentsHook])

    const handleLogout = useCallback(async () => {
        await auth.signOut()
        navigate('/login')
    }, [navigate])

    const handleStepClick = useCallback((project: Project, stepIndex: number) => {
        const stepNumber = stepIndex + 1
        const stepStatus = project[`step${stepNumber}_status` as keyof Project] as string

        if (stepStatus === 'Submitted' || stepStatus === 'Revision Requested') {
            navigate(`/teacher/step-approval/${project.project_id}/${stepNumber}`)
        } else if (stepStatus === 'Approved') {
            setSubmissionModal({ open: true, projectId: project.project_id, stepNumber, project })
        }
    }, [navigate, setSubmissionModal])

    const handleCloseSubmissionModal = useCallback(() => {
        setSubmissionModal({ open: false, projectId: null, stepNumber: null, project: null })
    }, [setSubmissionModal])

    const handleOpenDeleteSubmission = useCallback((project: Project, stepNumber: number) => {
        setDeleteSubmissionState({ open: true, project, stepNumber, deleting: false })
    }, [setDeleteSubmissionState])

    const handleDeleteSubmission = useCallback(async () => {
        const { project, stepNumber } = deleteSubmissionState
        if (!project || !stepNumber) return

        setDeleteSubmissionState(s => ({ ...s, deleting: true }))

        try {
            const { data: submissions } = await getDocuments(
                'submissions',
                buildConstraints({ eq: { project_id: project.project_id, step_number: stepNumber } })
            )

            if (submissions && (submissions as any[]).length > 0) {
                const submission = (submissions as any[])[0]

                if (submission.file_url) {
                    try {
                        const urlObj = new URL(submission.file_url)
                        const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/)
                        if (pathMatch?.[1]) {
                            await deleteObject(storageRef(storage, decodeURIComponent(pathMatch[1])))
                        }
                    } catch {
                        // Non-critical — storage file deletion failure should not block the rest
                    }
                }

                await deleteDocument('submissions', submission.id)
            }

            const updates: Record<string, string | number> = {
                [`step${stepNumber}_status`]: 'Not Started',
            }
            if (stepNumber <= project.current_step) {
                updates.current_step = stepNumber
                updates.current_step_status = 'Not Started'
            }
            await updateDocument('projects', project.project_id, updates)

            if (effectiveTeacherId) {
                await refreshProjects(effectiveTeacherId)
            }

            setDeleteSubmissionState({ open: false, project: null, stepNumber: null, deleting: false })
            showAlert(`Step ${stepNumber} submission deleted and reset to Not Started.`, 'Deleted')
        } catch (err: any) {
            console.error('Delete submission failed:', err)
            showAlert(err.message || 'Failed to delete submission.', 'Error')
            setDeleteSubmissionState(s => ({ ...s, deleting: false }))
        }
    }, [deleteSubmissionState, effectiveTeacherId, refreshProjects, setDeleteSubmissionState, showAlert])

    return {
        getCurrentStepName,
        getCurrentStepDueDate,
        getCurrentStepSubmissionStatus,
        getActionButtonText,
        handleActionClick,
        handleEmailStudent,
        handleEmailProjectStudent,
        handleCopyTeacherId,
        handleCopySignupLink,
        handleResendInvitation,
        handleConfirmResend,
        handleCloseInviteModal,
        handleLogout,
        handleStepClick,
        handleCloseSubmissionModal,
        handleOpenDeleteSubmission,
        handleDeleteSubmission,
    }
}
