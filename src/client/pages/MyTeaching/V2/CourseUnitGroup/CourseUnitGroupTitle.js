import React from 'react'

import { Badge, Typography } from '@mui/material'

const CourseGroupTitle = ({ title, badgeContent }) => (
  <Typography
    component="h2"
    variant="h6"
    sx={{
      display: 'flex',
      alignItems: 'center',
      marginTop: '-1.6em',
      paddingX: '0.5em',
      fontWeight: theme => theme.typography.fontWeightMedium,
      position: 'absolute',
      backgroundColor: theme => theme.palette.background.default,
      width: 'full',
      zIndex: 1,
      '&:has(+ button:hover), &:has(+ button):hover': {
        backgroundColor: '#e3f2fd',
        borderRadius: '0.5em',
      },
    }}
  >
    {title}
    {badgeContent && (
      <Badge badgeContent={badgeContent} color="primary" sx={{ marginLeft: '1.5rem', marginRight: '1rem' }} />
    )}
  </Typography>
)

export default CourseGroupTitle
