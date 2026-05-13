import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auth } from '../../../../firebaseConfig'
import { getDocument, getDocuments, buildConstraints } from '../../../../utils/firebaseHelpers'
import { useAlert } from '../../../../hooks/useAlert'
import type { CommentThreadHandle } from '../../../../components/CommentThread/CommentThread'

export function useStepApprovalData() {
    const { projectId, stepNumber } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState<any>(null)
    const [comment, setComment] = useState('')
    const [submissionFile, setSubmissionFile] = useState<string | null>(null)
    const [youtubeLink, setYoutubeLink] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [submissionDownloadUrl, setSubmissionDownloadUrl] = useState<string | null>(null)
    const [numPages, setNumPages] = useState<number | null>(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [scale, setScale] = useState(1.0)
    const [isApproving, setIsApproving] = useState(false)
    const [isSavingComment, setIsSavingComment] = useState(false)
    const [draftCommentDialog, setDraftCommentDialog] = useState<'approve' | 'revision' | null>(null)
    const { alertState, showAlert, closeAlert } = useAlert()

    // UI state for YouTube player and pop-out window
    const [showYouTubePlayer, setShowYouTubePlayer] = useState(false)
    const [isPoppedOut, setIsPoppedOut] = useState(false)
    const [navigateOnClose, setNavigateOnClose] = useState(false)

    // Refs
    const popupRef = useRef<Window | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const commentThreadRef = useRef<CommentThreadHandle>(null)
    const pdfPageWidthRef = useRef<number>(612)
    const pdfPageHeightRef = useRef<number>(792)

    // Poll the popup window to detect when it closes
    useEffect(() => {
        if (!isPoppedOut) return
        const interval = setInterval(() => {
            if (popupRef.current?.closed) {
                setIsPoppedOut(false)
                popupRef.current = null
            }
        }, 500)
        return () => clearInterval(interval)
    }, [isPoppedOut])

    useEffect(() => {
        const fetchData = async () => {
            setYoutubeLink(null)
            setSubmissionFile(null)

            const currentUser = auth.currentUser

            if (!currentUser) {
                navigate('/login')
                return
            }

            const { data: projectData, error: projectError } = await getDocument('projects', projectId!)

            if (projectError || !projectData) {
                console.error('Error fetching project:', projectError?.message)
                navigate('/teacher/dashboard')
                return
            }

            const { data: studentData } = await getDocument('users', (projectData as any).student_id)

            setProject({
                ...projectData,
                project_id: (projectData as any).id,
                student: studentData,
            })

            const { data: fileDataArray, error: fileError } = await getDocuments(
                'submissions',
                buildConstraints({
                    eq: { project_id: projectId, step_number: Number(stepNumber) },
                    orderBy: { field: 'submitted_at', direction: 'desc' },
                    limit: 1,
                })
            )

            if (fileError) {
                console.error('Error fetching submission file:', fileError.message)
            } else if (fileDataArray && (fileDataArray as any[]).length > 0) {
                const latestSubmission = (fileDataArray as any[])[0]

                if (latestSubmission.youtube_link) {
                    setYoutubeLink(latestSubmission.youtube_link)
                }

                if (latestSubmission.file_url) {
                    setSubmissionDownloadUrl(latestSubmission.file_url)
                    setSubmissionFile(latestSubmission.file_url)
                }

                if (latestSubmission.teacher_comments) {
                    setComment(latestSubmission.teacher_comments)
                }
            }

            setLoading(false)
        }

        fetchData()
    }, [projectId, stepNumber, navigate])

    return {
        projectId,
        stepNumber,
        project,
        comment,
        setComment,
        submissionFile,
        setSubmissionFile,
        submissionDownloadUrl,
        youtubeLink,
        loading,
        numPages,
        setNumPages,
        pageNumber,
        setPageNumber,
        scale,
        setScale,
        isApproving,
        setIsApproving,
        isSavingComment,
        setIsSavingComment,
        navigate,
        alertState,
        showAlert,
        closeAlert,
        showYouTubePlayer,
        setShowYouTubePlayer,
        isPoppedOut,
        setIsPoppedOut,
        navigateOnClose,
        setNavigateOnClose,
        popupRef,
        containerRef,
        commentThreadRef,
        pdfPageWidthRef,
        pdfPageHeightRef,
        draftCommentDialog,
        setDraftCommentDialog,
    }
}
