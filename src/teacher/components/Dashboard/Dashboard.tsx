import EmailIcon from '@mui/icons-material/Email'
import InviteModal from '../../../admin/components/InviteModal'
import ImpersonationBanner from '../../../admin/components/ImpersonationBanner'
import StepSubmissionModal from '../StepSubmissionModal/StepSubmissionModal'
import StudentsList from './StudentsList'
import ConfirmDialog from '../../../admin/components/ConfirmDialog'
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Stack,
    AppBar,
    Toolbar,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
} from '@mui/material'
import {
    Logout as LogoutIcon,
    Notifications as NotificationsIcon,
    UnfoldMore as UnfoldMoreIcon,
    UnfoldLess as UnfoldLessIcon,
} from '@mui/icons-material'
import Badge from '@mui/material/Badge'
import { useDashboardData } from './hooks/useData'
import { useDashboardHandlers } from './hooks/useHandlers'
import AlertDialog from '../../../components/AlertDialog/AlertDialog'
import orbiliusLogo from '../../../assets/merle-386x386-yellow.svg'

export default function TeacherDashboard() {
    const data = useDashboardData()
    const handlers = useDashboardHandlers(data)

    const {
        user,
        userProfile,
        projects,
        navigate,
        alertState,
        closeAlert,
        showInviteModal,
        setShowInviteModal,
        initialEmail,
        resendConfirmOpen,
        setResendConfirmOpen,
        emailToResend,
        submissionModal,
        allStudentsExpanded,
        setAllStudentsExpanded,
        deleteSubmissionState,
        setDeleteSubmissionState,
        effectiveTeacherId,
        studentsHook,
        students,
        projectsNeedingReview,
        showAlert,
    } = data

    const {
        getCurrentStepName,
        getCurrentStepSubmissionStatus,
        handleEmailStudent,
        handleEmailProjectStudent,
        handleResendInvitation,
        handleConfirmResend,
        handleCloseInviteModal,
        handleLogout,
        handleStepClick,
        handleOpenDeleteSubmission,
        handleDeleteSubmission,
        handleCloseSubmissionModal,
    } = handlers

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <ImpersonationBanner />
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        <img src={orbiliusLogo} alt="Orbilius" style={{ height: '40px' }} />
                        <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                            Orbilius
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {userProfile && (
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {userProfile.first_name} {userProfile.last_name}
                            </Typography>
                        )}
                        <Chip label="Teacher" color="secondary" sx={{ fontWeight: 600 }} />
                        <Button
                            variant="outlined"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{ textTransform: 'none' }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Stack spacing={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h4" component="h1">
                            Teacher Dashboard
                        </Typography>
                        {projectsNeedingReview > 0 && (
                            <Tooltip
                                title={`${projectsNeedingReview} project${projectsNeedingReview === 1 ? '' : 's'} need${projectsNeedingReview === 1 ? 's' : ''} review`}
                                arrow
                            >
                                <Badge
                                    badgeContent={projectsNeedingReview}
                                    color="error"
                                    sx={{
                                        '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 700 },
                                        animation: 'bellRing 2s ease-in-out infinite',
                                        '@keyframes bellRing': {
                                            '0%': { transform: 'rotate(0deg)' },
                                            '5%': { transform: 'rotate(15deg)' },
                                            '10%': { transform: 'rotate(-13deg)' },
                                            '15%': { transform: 'rotate(11deg)' },
                                            '20%': { transform: 'rotate(-9deg)' },
                                            '25%': { transform: 'rotate(7deg)' },
                                            '30%': { transform: 'rotate(-5deg)' },
                                            '35%': { transform: 'rotate(3deg)' },
                                            '40%': { transform: 'rotate(0deg)' },
                                            '100%': { transform: 'rotate(0deg)' },
                                        },
                                    }}
                                >
                                    <NotificationsIcon sx={{ color: '#ffd700', fontSize: 28 }} />
                                </Badge>
                            </Tooltip>
                        )}
                    </Box>

                    {/* Students Section with Projects */}
                    {students.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h5" gutterBottom>
                                Welcome to Orbilius!
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                You don't have any students yet. Invite students to join your class and start their
                                science fair journey.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<EmailIcon />}
                                onClick={() => setShowInviteModal(true)}
                                size="large"
                            >
                                Invite Your First Student
                            </Button>
                        </Paper>
                    ) : (
                        <Paper sx={{ p: 3 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2,
                                }}
                            >
                                <Typography variant="h5">Students & Projects</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title={allStudentsExpanded ? 'Collapse All' : 'Expand All'}>
                                        <IconButton
                                            onClick={() => setAllStudentsExpanded(!allStudentsExpanded)}
                                            size="small"
                                            sx={{ width: 40, height: 40, borderRadius: '50%' }}
                                        >
                                            {allStudentsExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                                        </IconButton>
                                    </Tooltip>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<EmailIcon />}
                                        onClick={() => setShowInviteModal(true)}
                                    >
                                        Invite Student
                                    </Button>
                                </Box>
                            </Box>
                            <StudentsList
                                students={students}
                                projects={projects}
                                onDelete={studentsHook.openConfirm}
                                onResendInvitation={handleResendInvitation}
                                onEmailStudent={handleEmailStudent}
                                onEmailProjectStudent={handleEmailProjectStudent}
                                onStepClick={handleStepClick}
                                onViewSubmission={(project, stepNumber) => handleStepClick(project, stepNumber - 1)}
                                onDeleteSubmission={handleOpenDeleteSubmission}
                                getCurrentStepName={getCurrentStepName}
                                getCurrentStepSubmissionStatus={getCurrentStepSubmissionStatus}
                                navigate={navigate}
                                allExpanded={allStudentsExpanded}
                            />
                        </Paper>
                    )}

                    {/* Invitation Modal */}
                    {showInviteModal && (
                        <InviteModal
                            open={showInviteModal}
                            onClose={handleCloseInviteModal}
                            role="student"
                            teacherId={effectiveTeacherId}
                            showAlert={showAlert}
                            initialEmail={initialEmail}
                        />
                    )}

                    {/* Resend Confirmation Dialog */}
                    <Dialog open={resendConfirmOpen} onClose={() => setResendConfirmOpen(false)}>
                        <DialogTitle>Resend Invitation</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to resend the invitation to {emailToResend}?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setResendConfirmOpen(false)}>Cancel</Button>
                            <Button onClick={handleConfirmResend} variant="contained" color="primary">
                                Resend
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <ConfirmDialog
                        open={studentsHook.confirmState.open}
                        title={`Delete ${studentsHook.confirmState.type}`}
                        message={
                            studentsHook.confirmState.status === 'active'
                                ? `⚠️ WARNING: You are about to permanently delete ${studentsHook.confirmState.name} and ALL associated data.\n\nThis action will delete:\n• Student account\n• All student projects\n• All project submissions and files\n• All comments and feedback\n\nThis action CANNOT be undone. Are you absolutely sure you want to proceed?`
                                : `Are you sure you want to delete the invitation for ${studentsHook.confirmState.name}?`
                        }
                        onConfirm={studentsHook.confirmDelete}
                        onCancel={studentsHook.closeConfirm}
                        confirmText="Delete"
                        cancelText="Cancel"
                        requireTypedConfirmation={
                            studentsHook.confirmState.status === 'active' ? 'delete' : undefined
                        }
                    />

                    {/* Delete Submission Confirmation Dialog */}
                    <ConfirmDialog
                        open={deleteSubmissionState.open}
                        title="Delete Submission"
                        message={`This will permanently delete the Step ${deleteSubmissionState.stepNumber} submission for "${deleteSubmissionState.project?.project_title}" and reset the step to Not Started. The student will need to re-submit.\n\nThis action cannot be undone.`}
                        onConfirm={handleDeleteSubmission}
                        onCancel={() =>
                            setDeleteSubmissionState({
                                open: false,
                                project: null,
                                stepNumber: null,
                                deleting: false,
                            })
                        }
                        confirmText={deleteSubmissionState.deleting ? 'Deleting...' : 'Delete'}
                        cancelText="Cancel"
                        requireTypedConfirmation="delete"
                    />
                </Stack>
            </Container>

            <AlertDialog
                open={alertState.open}
                title={alertState.title}
                message={alertState.message}
                onClose={closeAlert}
            />

            {submissionModal.open && submissionModal.projectId && submissionModal.stepNumber && (
                <StepSubmissionModal
                    open={submissionModal.open}
                    onClose={handleCloseSubmissionModal}
                    projectId={submissionModal.projectId}
                    stepNumber={submissionModal.stepNumber}
                    project={submissionModal.project}
                />
            )}
        </Box>
    )
}
