import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import { useCreateProjectData } from './hooks/useData';
import { useCreateProjectHandlers } from './hooks/useHandlers';
import AlertDialog from '../AlertDialog/AlertDialog';

export default function CreateProject() {
  const data = useCreateProjectData();
  const handlers = useCreateProjectHandlers(data);

  const { projectTitle, setProjectTitle, grade, setGrade, alertState, closeAlert } = data;

  const { handleSubmit } = handlers;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
            Create New Project
          </Typography>

          <Stack spacing={3}>
            <TextField
              type="text"
              label="Project Title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />

            <TextField
              type="number"
              label="Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />

            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Project Timeline
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Each step will have a 1-month deadline starting from today:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Step 1: Initial Research - Due in 1 month" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Step 2: Design Brief - Due in 2 months" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Step 3: Planning - Due in 3 months" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Step 4: Implementation - Due in 4 months" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Step 5: Archival Records - Due in 5 months" />
                </ListItem>
              </List>
            </Paper>

            <Button
              onClick={handleSubmit}
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 2 }}
            >
              Create Project
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <AlertDialog
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
    </Box>
  );
}
