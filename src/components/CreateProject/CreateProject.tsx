import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useCreateProjectData } from './hooks/useData';
import { useCreateProjectHandlers } from './hooks/useHandlers';
import { useTheme } from '../../contexts/ThemeContext';
import AlertDialog from '../AlertDialog/AlertDialog';
import yellowLogo from '../../assets/merle-386x386-yellow.svg';
import regularLogo from '../../assets/merle-386x386.svg';

export default function CreateProject() {
  const { currentTheme } = useTheme();
  const merleLogo = currentTheme === 'light' ? regularLogo : yellowLogo;
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img src={merleLogo} alt="Orbilius Logo" style={{ width: 40, height: 40 }} />
            </Box>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              align="center"
              sx={{ flex: 1, m: 0 }}
            >
              Create New Project
            </Typography>
          </Stack>

          <Box
            sx={{
              mb: 3,
              p: 2.5,
              bgcolor: 'primary.main',
              borderRadius: 2,
              color: 'primary.contrastText',
              boxShadow: 2,
            }}
          >
            <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 0.5 }}>
              Welcome to Orbilius!
            </Typography>
            <Typography variant="body1" align="center" sx={{ mt: 1.5, opacity: 0.95 }}>
              To begin your journey give your first project a name and select your current grade
              level.
            </Typography>
          </Box>

          <Stack spacing={3}>
            <TextField
              type="text"
              label="Project Title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
              fullWidth
              variant="outlined"
              helperText="Unsure of your project? Provide a temporary name, e.g. History Project, Art Project. You can change this later."
            />

            <FormControl component="fieldset" required>
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Grade
              </FormLabel>
              <RadioGroup
                row
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                sx={{ justifyContent: 'center', gap: 3 }}
              >
                <FormControlLabel value="9" control={<Radio />} label="9" />
                <FormControlLabel value="10" control={<Radio />} label="10" />
                <FormControlLabel value="11" control={<Radio />} label="11" />
                <FormControlLabel value="12" control={<Radio />} label="12" />
              </RadioGroup>
            </FormControl>

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
