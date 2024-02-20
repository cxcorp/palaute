import React from 'react'
import { useTranslation } from 'react-i18next'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material'

import FeedbackTargetList from '../FeedbackTargetList/FeedbackTargetList'
import DisabledCourseWarning from './DisabledCourseWarning'
import FeedbackResponseChip from '../../FeedbackResponseChip'

import commonStyles from '../utils/styles'
import latestCourseRealisationFeedbackResponseGiven from '../utils/utils'

import { getLanguageValue } from '../../../../util/languageUtils'
import { getCourseCode } from '../../../../util/courseIdentifiers'

const styles = {
  accordion: {
    boxShadow: 'none',
    borderRadius: 0,
    mt: 2,
    '&:before': {
      display: 'none',
    },
    minHeight: '100px',
  },
  details: {
    display: 'block',
    padding: 0,
  },
}

const CourseUnitAccordion = ({ courseUnit }) => {
  const { i18n } = useTranslation()

  const { name, courseCode, courseRealisations, disabledCourse } = courseUnit

  const visibleCourseCode = getCourseCode(courseUnit)
  const courseName = getLanguageValue(name, i18n.language)

  const latestFeedbackTargetResponseNotGiven = latestCourseRealisationFeedbackResponseGiven(courseRealisations)

  return (
    <Accordion
      sx={{
        ...styles.accordion,
      }}
      square
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      data-cy="my-teaching-course-unit-item"
    >
      <AccordionSummary
        id={`course-unit-accordion-header-${courseCode}`}
        aria-controls={`course-unit-accordion-content-${courseCode}`}
        expandIcon={<ExpandMoreIcon />}
        data-cy={`my-teaching-course-unit-accordion-${courseCode}`}
        sx={{
          ...(disabledCourse && commonStyles.alert),
        }}
      >
        <Box>
          <Typography component="h3" variant="subtitle1" sx={{ mr: 2, fontWeight: 'bold' }}>
            {visibleCourseCode} {courseName}
          </Typography>

          {disabledCourse && <DisabledCourseWarning />}

          {latestFeedbackTargetResponseNotGiven && (
            <FeedbackResponseChip
              id={latestFeedbackTargetResponseNotGiven.id}
              feedbackResponseGiven={latestFeedbackTargetResponseNotGiven.feedbackResponseGiven}
              feedbackResponseSent={latestFeedbackTargetResponseNotGiven.feedbackResponseSent}
              isOld={latestFeedbackTargetResponseNotGiven.isOld}
              ongoing={false}
              continuous={false}
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={styles.details}>
        {courseRealisations.map(courseRealisation => (
          <FeedbackTargetList key={courseRealisation.id} courseRealisation={courseRealisation} />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

export default CourseUnitAccordion