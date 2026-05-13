import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { auth } from '../../firebaseConfig';
import {
  getDocuments,
  getDocument,
  createDocument,
  buildConstraints,
} from '../../utils/firebaseHelpers';

export interface StepComment {
  id: string;
  project_id: string;
  step_number: number;
  author_id: string;
  author_name: string;
  author_role: 'teacher' | 'student' | 'admin';
  comment: string;
  created_at: any;
}

const STEP_NAMES = [
  'Initial Research',
  'Design Brief',
  'Planning',
  'Implementation',
  'Archival Records',
];

interface CommentThreadProps {
  projectId: string;
  studentId?: string;
  teacherId?: string;
  stepNumber?: number;
  maxHeight?: string;
}

export interface CommentThreadHandle {
  submitComment: () => Promise<void>;
  getCommentText: () => string;
}

const CommentThread = forwardRef<CommentThreadHandle, CommentThreadProps>(function CommentThread({ projectId, studentId, teacherId, stepNumber, maxHeight = '300px' }, ref) {
  const [comments, setComments] = useState<StepComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number>(parseInt(maxHeight) || 300);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const fetchComments = async () => {
    try {
      const eqFilter: Record<string, any> = { project_id: projectId };
      if (stepNumber) {
        eqFilter.step_number = stepNumber;
      }

      const { data, error } = await getDocuments(
        'step_comments',
        buildConstraints({
          eq: eqFilter,
        })
      );

      if (error) {
        console.error('Error fetching comments:', error);
        setLoading(false);
        return;
      }

      const sorted = ((data as StepComment[]) || []).sort((a, b) => {
        const aTime = a.created_at?.seconds || 0;
        const bTime = b.created_at?.seconds || 0;
        return aTime - bTime;
      });
      setComments(sorted);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchComments();
    } else {
      setLoading(false);
    }
  }, [projectId, stepNumber]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSend = async () => {
    const text = newComment.trim();
    if (!text) return;

    const user = auth.currentUser;
    if (!user) return;

    setSending(true);
    try {
      const { data: usersData } = await getDocuments(
        'users',
        buildConstraints({ eq: { id: user.uid }, limit: 1 })
      );
      const userDoc = usersData && (usersData as any[])[0];
      const authorName = userDoc
        ? `${userDoc.first_name || ''} ${userDoc.last_name || ''}`.trim()
        : user.displayName || user.email || 'Unknown';
      const authorRole = userDoc?.user_type || 'student';

      // Get student_id/teacher_id from props or fetch from project
      let sId = studentId;
      let tId = teacherId;
      if (!sId || !tId) {
        const { data: projectDoc } = await getDocument('projects', projectId);
        sId = (projectDoc as any)?.student_id || '';
        tId = (projectDoc as any)?.teacher_id || '';
      }

      await createDocument('step_comments', {
        project_id: projectId,
        student_id: sId,
        teacher_id: tId,
        step_number: stepNumber || 0,
        author_id: user.uid,
        author_name: authorName,
        author_role: authorRole,
        comment: text,
      });

      setNewComment('');
      await fetchComments();
    } catch (err) {
      console.error('Error sending comment:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useImperativeHandle(ref, () => ({
    submitComment: handleSend,
    getCommentText: () => newComment.trim(),
  }));

  const formatTimestamp = (ts: any): string => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDragStart = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = panelHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const handleDragMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = ev.clientY - startY.current;
      setPanelHeight(Math.max(80, Math.min(800, startHeight.current + delta)));
    };

    const handleDragEnd = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          height: panelHeight,
          maxHeight: panelHeight,
          px: 2,
          py: 1,
          bgcolor: 'rgba(0,0,0,0.2)',
          borderRadius: '8px 8px 0 0',
          minHeight: '80px',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No comments yet
          </Typography>
        ) : (
          comments.map((c) => {
            const isStudent = c.author_role === 'student';
            const isRight = !isStudent; // teacher/admin on right
            const stepLabel = c.step_number > 0
              ? `Step ${c.step_number}: ${STEP_NAMES[c.step_number - 1] || ''}`
              : null;

            return (
              <Box
                key={c.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isRight ? 'flex-end' : 'flex-start',
                  mb: 1.5,
                }}
              >
                {/* Author name */}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    mb: 0.25,
                    px: 1,
                    fontSize: '0.65rem',
                  }}
                >
                  {c.author_name}
                </Typography>

                {/* Speech bubble */}
                <Box
                  sx={{
                    maxWidth: '75%',
                    px: 2,
                    py: 1,
                    bgcolor: isRight ? 'primary.main' : 'rgba(255,255,255,0.12)',
                    color: isRight ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 3,
                    borderTopRightRadius: isRight ? 4 : undefined,
                    borderTopLeftRadius: isRight ? undefined : 4,
                    position: 'relative',
                  }}
                >
                  {/* Step label (if showing all project comments) */}
                  {!stepNumber && stepLabel && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontWeight: 600,
                        fontSize: '0.6rem',
                        opacity: 0.7,
                        mb: 0.25,
                        textTransform: 'uppercase',
                        letterSpacing: 0.3,
                      }}
                    >
                      {stepLabel}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                    {c.comment}
                  </Typography>
                </Box>

                {/* Timestamp below bubble */}
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.disabled',
                    fontSize: '0.6rem',
                    mt: 0.25,
                    px: 1,
                  }}
                >
                  {formatTimestamp(c.created_at)}
                </Typography>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Drag handle */}
      <Box
        onMouseDown={handleDragStart}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 12,
          cursor: 'row-resize',
          bgcolor: 'rgba(0,0,0,0.25)',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' },
          transition: 'background-color 0.15s',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 3,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.3)',
          }}
        />
      </Box>

      {/* Compose area */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'rgba(255,255,255,0.08)',
          borderRadius: '0 0 8px 8px',
          px: 1.5,
          py: 0.5,
        }}
      >
        <TextField
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          size="small"
          fullWidth
          multiline
          maxRows={3}
          disabled={sending}
          variant="outlined"
          sx={{
            '& .MuiInputBase-input': { py: 0.75 },
            '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.12)' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!newComment.trim() || sending}
          color="primary"
          size="small"
        >
          {sending ? <CircularProgress size={18} /> : <SendIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  );
});

export default CommentThread;
