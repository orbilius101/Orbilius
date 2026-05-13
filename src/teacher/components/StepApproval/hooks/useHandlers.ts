import { useCallback } from 'react'
import { updateDocument } from '../../../../utils/firebaseHelpers'
import type { NavigateFunction } from 'react-router-dom'

interface StepApprovalData {
    projectId: string | undefined
    stepNumber: string | undefined
    setNumPages: (n: number) => void
    setIsApproving: (v: boolean) => void
    setIsSavingComment: (v: boolean) => void
    setScale: (v: number | ((prev: number) => number)) => void
    navigate: NavigateFunction
    showAlert: (message: string, title: string) => void
    containerRef: React.RefObject<HTMLDivElement>
    pdfPageWidthRef: React.MutableRefObject<number>
    pdfPageHeightRef: React.MutableRefObject<number>
}

const STEP_NAMES: Record<number, string> = {
    1: 'Initial Research',
    2: 'Design Brief',
    3: 'Planning',
    4: 'Implementation',
    5: 'Archival Records',
}

export function useStepApprovalHandlers(data: StepApprovalData) {
    const {
        projectId,
        stepNumber,
        setNumPages,
        setIsApproving,
        setIsSavingComment,
        setScale,
        navigate,
        showAlert,
        containerRef,
        pdfPageWidthRef,
        pdfPageHeightRef,
    } = data

    const getStepName = useCallback((stepNum: number | string): string => {
        return STEP_NAMES[Number(stepNum)] || 'Unknown'
    }, [])

    const extractYouTubeVideoId = useCallback((url: string): string | null => {
        if (!url) return null
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
            /youtube\.com\/embed\/([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
        ]
        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match?.[1]) return match[1]
        }
        return null
    }, [])

    const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
        setNumPages(n)
    }, [setNumPages])

    const onDocumentLoadError = useCallback((error: Error) => {
        console.error('PDF load error:', error)
        showAlert(
            'Could not preview the submitted file. Use the download link to view it.',
            'Preview Unavailable'
        )
    }, [showAlert])

    const handleFitPage = useCallback(() => {
        if (!containerRef.current) {
            setScale(1)
            return
        }
        const containerWidth = containerRef.current.clientWidth - 32
        const containerHeight = containerRef.current.clientHeight - 32
        const widthScale = containerWidth / pdfPageWidthRef.current
        const heightScale = containerHeight / pdfPageHeightRef.current
        setScale(Math.round(Math.min(widthScale, heightScale) * 100) / 100)
    }, [setScale, containerRef, pdfPageWidthRef, pdfPageHeightRef])

    const handlePageRenderSuccess = useCallback((page: any) => {
        if (page?.originalWidth) pdfPageWidthRef.current = page.originalWidth
        if (page?.originalHeight) pdfPageHeightRef.current = page.originalHeight
    }, [pdfPageWidthRef, pdfPageHeightRef])

    const handleSaveComment = useCallback(async () => {
        setIsSavingComment(true)

        try {
            const currentStepStatusField = `step${stepNumber}_status`
            const { error: statusError } = await updateDocument('projects', projectId!, {
                [currentStepStatusField]: 'Revision Requested',
                current_step: parseInt(stepNumber!),
            })

            if (statusError) {
                console.error('Error updating project status:', statusError.message)
                showAlert('Error updating status. Please try again.', 'Error')
            } else {
                showAlert(
                    'Revision requested. Student will see your feedback and can resubmit.',
                    'Success'
                )
            }
        } catch (error) {
            console.error('Error saving comment:', error)
            showAlert('Error updating status. Please try again.', 'Error')
        }

        setIsSavingComment(false)
    }, [projectId, stepNumber, setIsSavingComment, showAlert])

    const handleApprove = useCallback(async () => {
        setIsApproving(true)

        try {
            const currentStepStatusField = `step${stepNumber}_status`
            const updateData: Record<string, string | number | boolean> = {
                [currentStepStatusField]: 'Approved',
            }

            if (parseInt(stepNumber!) === 5) {
                updateData.submitted_to_orbilius = true
            }

            if (parseInt(stepNumber!) < 5) {
                const nextStep = parseInt(stepNumber!) + 1
                updateData.current_step = nextStep
                updateData[`step${nextStep}_status`] = 'In Progress'
            }

            const { error: updateError } = await updateDocument('projects', projectId!, updateData)

            if (updateError) {
                console.error('Error updating project:', updateError.message)
                showAlert('Error approving step. Please try again.', 'Error')
            } else {
                showAlert('Step approved successfully!', 'Success')
                navigate('/teacher/dashboard')
            }
        } catch (error) {
            console.error('Error approving step:', error)
            showAlert('Error approving step. Please try again.', 'Error')
        }

        setIsApproving(false)
    }, [projectId, stepNumber, setIsApproving, showAlert, navigate])

    return {
        getStepName,
        extractYouTubeVideoId,
        onDocumentLoadSuccess,
        onDocumentLoadError,
        handleFitPage,
        handlePageRenderSuccess,
        handleSaveComment,
        handleApprove,
    }
}
