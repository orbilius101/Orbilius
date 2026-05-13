import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../../../firebaseConfig'
import { getDocument, getDocuments, buildConstraints } from '../../../../utils/firebaseHelpers'
import { useAlert } from '../../../../hooks/useAlert'
import { useStudents } from './useStudents'
import type { Project, UserProfile } from '../../../../types'

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

export function useDashboardData() {
    const [user, setUser] = useState<any>(null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [projects, setProjects] = useState<Project[]>([])
    const navigate = useNavigate()
    const { alertState, showAlert, closeAlert } = useAlert()

    // Modal / UI state
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [initialEmail, setInitialEmail] = useState('')
    const [resendConfirmOpen, setResendConfirmOpen] = useState(false)
    const [emailToResend, setEmailToResend] = useState('')
    const [submissionModal, setSubmissionModal] = useState<SubmissionModalState>({
        open: false,
        projectId: null,
        stepNumber: null,
        project: null,
    })
    const [allStudentsExpanded, setAllStudentsExpanded] = useState(true)
    const [deleteSubmissionState, setDeleteSubmissionState] = useState<DeleteSubmissionState>({
        open: false,
        project: null,
        stepNumber: null,
        deleting: false,
    })

    const impersonatingTeacherId = sessionStorage.getItem('impersonating_teacher_uid')
    const effectiveTeacherId = impersonatingTeacherId || user?.uid

    const fetchProjects = async (teacherId: string) => {
        const { data: projectsData, error: projectsError } = await getDocuments(
            'projects',
            buildConstraints({
                eq: { teacher_id: teacherId },
                orderBy: { field: 'created_at', direction: 'desc' },
            })
        )

        if (projectsError) {
            console.error('Error fetching projects:', projectsError.message)
            setProjects([])
        } else {
            const projectsWithStudents = await Promise.all(
                ((projectsData as any[]) || []).map(async project => {
                    const { data: studentData } = await getDocument('users', project.student_id)
                    return {
                        ...project,
                        project_id: project.id,
                        student: studentData,
                    }
                })
            )
            setProjects(projectsWithStudents as Project[])
        }
    }

    const studentsHook = useStudents(effectiveTeacherId, showAlert, fetchProjects)

    const projectsNeedingReview = projects.filter(project => {
        for (let i = 1; i <= 5; i++) {
            if (project[`step${i}_status` as keyof Project] === 'Submitted') return true
        }
        return false
    }).length

    useEffect(() => {
        const fetchUserAndProjects = async () => {
            const currentUser = auth.currentUser

            if (!currentUser) {
                navigate('/login')
                return
            }

            setUser(currentUser)

            const impersonatingId = sessionStorage.getItem('impersonating_teacher_uid')
            const effectiveUserId = impersonatingId || currentUser.uid

            const { data: profile, error: profileError } = await getDocument('users', effectiveUserId)

            if (profileError) {
                console.error('Error fetching user profile:', profileError.message)
            } else {
                setUserProfile(profile as UserProfile)
            }

            await fetchProjects(effectiveUserId)
        }

        fetchUserAndProjects()
    }, [navigate])

    return {
        user,
        userProfile,
        projects,
        navigate,
        alertState,
        showAlert,
        closeAlert,
        refreshProjects: fetchProjects,
        showInviteModal,
        setShowInviteModal,
        initialEmail,
        setInitialEmail,
        resendConfirmOpen,
        setResendConfirmOpen,
        emailToResend,
        setEmailToResend,
        submissionModal,
        setSubmissionModal,
        allStudentsExpanded,
        setAllStudentsExpanded,
        deleteSubmissionState,
        setDeleteSubmissionState,
        impersonatingTeacherId,
        effectiveTeacherId,
        studentsHook,
        students: studentsHook.students,
        projectsNeedingReview,
    }
}
