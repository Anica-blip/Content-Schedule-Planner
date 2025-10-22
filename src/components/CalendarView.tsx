import React, { useState } from 'react';
import { Box, Paper, Typography, Button, useMediaQuery, useTheme } from '@mui/material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { SocialMediaPost } from '../types';

interface CalendarViewProps {
  posts: SocialMediaPost[];
  onDateSelect: (date: Date) => void;
  onPostSelect: (post: SocialMediaPost) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ posts, onDateSelect, onPostSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group posts by date for easier lookup
  const postsByDate = posts.reduce<Record<string, SocialMediaPost[]>>((acc, post) => {
    const dateKey = format(new Date(post.scheduledDate), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(post);
    return acc;
  }, {});

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getPostsForDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return postsByDate[dateKey] || [];
  };

  const isToday = (day: Date) => {
    return isSameDay(day, new Date());
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button onClick={handlePreviousMonth}>&lt; Previous</Button>
        <Typography variant="h5" component="h2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <Button onClick={handleNextMonth}>Next &gt;</Button>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {dayNames.map(day => (
          <Typography key={day} sx={{ textAlign: 'center', fontWeight: 'bold', p: 1 }}>
            {isMobile ? day[0] : day}
          </Typography>
        ))}
      </Box>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 1,
        '& > div': {
          minHeight: isMobile ? '60px' : '100px',
          p: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
        }
      }}>
        {daysInMonth.map((day, index) => {
          const dayPosts = getPostsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          
          return (
            <Box 
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              sx={{
                cursor: 'pointer',
                backgroundColor: isDayToday ? 'action.hover' : 'background.paper',
                opacity: isCurrentMonth ? 1 : 0.5,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  textAlign: 'right',
                  fontWeight: isDayToday ? 'bold' : 'normal',
                  mb: 0.5
                }}
              >
                {format(day, 'd')}
              </Typography>
              
              <Box sx={{ overflow: 'hidden', maxHeight: '80%' }}>
                {dayPosts.slice(0, 2).map((post, i) => (
                  <Box 
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPostSelect(post);
                    }}
                    sx={{
                      fontSize: '0.7rem',
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      p: 0.5,
                      mb: 0.5,
                      borderRadius: 0.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    {post.title || 'Untitled'}
                  </Box>
                ))}
                
                {dayPosts.length > 2 && (
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
                    +{dayPosts.length - 2} more
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default CalendarView;
