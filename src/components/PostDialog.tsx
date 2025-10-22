import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControlLabel,
  FormGroup,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { SocialMediaPost, PostFormData } from '../types';

const PLATFORMS = [
  'Facebook',
  'Twitter',
  'Instagram',
  'LinkedIn',
  'TikTok',
  'Pinterest',
];

interface PostDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PostFormData, id?: string) => void;
  onDelete: (id: string) => void;
  selectedDate: Date;
  post: SocialMediaPost | null;
}

const PostDialog: React.FC<PostDialogProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  post,
}) => {
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    description: '',
    imageUrl: '',
    scheduledDate: new Date(),
    platforms: [],
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl || '',
        scheduledDate: new Date(post.scheduledDate),
        platforms: [...post.platforms],
      });
    } else if (open) {
      // Reset form with selected date when opening for a new post
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        scheduledDate: selectedDate,
        platforms: [],
      });
    }
  }, [post, open, selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        scheduledDate: date,
      }));
    }
  };

  const handlePlatformsChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      platforms: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, post?.id);
  };

  const handleDelete = () => {
    if (post) {
      onDelete(post.id);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        {post ? 'Edit Post' : 'Schedule New Post'}
        {post && (
          <IconButton
            aria-label="delete"
            onClick={handleDelete}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.error.main,
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Post Title"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleChange}
              required
            />
            
            <TextField
              margin="dense"
              name="description"
              label="Post Description"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Scheduled Date"
                value={formData.scheduledDate}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
              <TimePicker
                label="Scheduled Time"
                value={formData.scheduledDate}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Platforms</InputLabel>
              <Select
                multiple
                value={formData.platforms}
                onChange={handlePlatformsChange}
                renderValue={(selected) => selected.join(', ')}
                required
              >
                {PLATFORMS.map((platform) => (
                  <MenuItem key={platform} value={platform}>
                    <Checkbox checked={formData.platforms.indexOf(platform) > -1} />
                    <ListItemText primary={platform} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Image Preview
              </Typography>
              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 150,
                  bgcolor: 'background.paper',
                }}
              >
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{ mt: 2 }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({
                            ...prev,
                            imageUrl: reader.result as string,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                  {formData.imageUrl ? 'Change image' : 'No image selected'}
                </Typography>
              </Box>
              {!formData.imageUrl && (
                <TextField
                  fullWidth
                  margin="dense"
                  name="imageUrl"
                  label="Or enter image URL"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ImageIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>
            
            {post && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Created: {new Date(post.createdAt).toLocaleString('en-GB')}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated: {new Date(post.updatedAt).toLocaleString('en-GB')}
                </Typography>
              </Box>
            )}
          </Box>
        </LocalizationProvider>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          {post ? 'Update' : 'Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostDialog;
