import { Modal, Box, Typography, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface SharedModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

export default function SharedModal({ open, onClose, title, children }: SharedModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        sx={{
          width: '90%',
          maxWidth: 1200,
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography id="modal-title" variant="h5" component="h2">
            {title}
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body - Scrollable */}
        <Box
          sx={{
            p: 3,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </Box>
      </Paper>
    </Modal>
  );
}
