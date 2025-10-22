import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Snackbar, 
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Tabs,
  Tab,
  Paper,
  Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  ScheduleItem, 
  ScheduleFormData, 
  EventType,
  CalendarExportOptions,
  CalendarImportOptions
} from './types';
import CalendarView from './components/CalendarView';
import ScheduleItemDialog from './components/ScheduleItemDialog';
import { format, parseISO, addDays } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import {
  Menu as MenuIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const LOCAL_STORAGE_KEY = 'socialMediaPosts';

const App: React.FC = () => {
  const [posts, setPosts] = useState<SocialMediaPost[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Save posts to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedPost(null);
    setOpenDialog(true);
  };

  const handlePostSelect = (post: SocialMediaPost) => {
    setSelectedPost(post);
    setOpenDialog(true);
  };

  const handleSavePost = (data: PostFormData, id?: string) => {
    const now = new Date();
    
    if (id) {
      // Update existing post
      setPosts(posts.map(post => 
        post.id === id 
          ? { ...post, ...data, updatedAt: now, scheduledDate: data.scheduledDate || post.scheduledDate }
          : post
      ));
      showSnackbar('Post updated successfully!', 'success');
    } else {
      // Create new post
      const newPost: SocialMediaPost = {
        id: `post-${Date.now()}`,
        ...data,
        scheduledDate: data.scheduledDate || new Date(),
        status: 'scheduled',
        createdAt: now,
        updatedAt: now,
      };
      setPosts([...posts, newPost]);
      showSnackbar('Post scheduled successfully!', 'success');
    }
    
    setOpenDialog(false);
    setSelectedPost(null);
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(post => post.id !== id));
    setOpenDialog(false);
    setSelectedPost(null);
    showSnackbar('Post deleted successfully!', 'info');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              3C Thread To Success - Content Calendar
            </Typography>
            <Button 
              color="inherit" 
              onClick={() => {
                setSelectedPost(null);
                setOpenDialog(true);
              }}
            >
              New Post
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <CalendarView 
            posts={posts} 
            onDateSelect={handleDateSelect}
            onPostSelect={handlePostSelect}
          />
        </Container>
        
        <PostDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setSelectedPost(null);
          }}
          onSave={handleSavePost}
          onDelete={handleDeletePost}
          selectedDate={selectedDate}
          post={selectedPost}
        />
        
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity as any} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default App;
