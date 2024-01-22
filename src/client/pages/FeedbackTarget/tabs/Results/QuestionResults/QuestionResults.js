import React, { useMemo } from 'react'

import { Box, Typography, Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getQuestionsWithFeedback } from './utils'
import QuestionItem from './QuestionItem'

const QuestionSection = ({ title, count, children, ...props }) => (
  <Box my="3rem" display="flex" flexDirection="column" rowGap="1rem" {...props}>
    <Box display="flex" gap="1rem" mb="1rem" alignItems="end">
      <Typography component="h4">{title}</Typography>
      <Chip label={count} variant="outlined" size="small" />
    </Box>
    {children}
  </Box>
)

const QuestionResults = React.memo(
  ({
    publicityConfigurableQuestionIds,
    publicQuestionIds,
    questions,
    questionOrder,
    feedbacks,
    isResponsibleTeacher,
    isOrganisationUser,
    feedbackCount,
    feedbackTargetId,
  }) => {
    const { t } = useTranslation()

    const questionsWithFeedbacks = useMemo(
      () => getQuestionsWithFeedback(questions, questionOrder, feedbacks),
      [questions, feedbacks, publicQuestionIds]
    )

    const openQuestions = questionsWithFeedbacks.filter(
      q => q.type === 'OPEN' && (isOrganisationUser || isResponsibleTeacher || publicQuestionIds.includes(q.id))
    )

    const notOpenQuestions = questionsWithFeedbacks.filter(
      q => q.type !== 'OPEN' && (isOrganisationUser || isResponsibleTeacher || publicQuestionIds.includes(q.id))
    )

    return (
      <>
        <QuestionSection
          title={t('questionResults:multipleChoiceQuestions')}
          count={notOpenQuestions.length}
          data-cy={`feedback-target-results-multiple-choice-questions-${notOpenQuestions.length}`}
        >
          <Typography variant="body2">{t('questionResults:multipleChoiceScale')}</Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {notOpenQuestions.map(q => (
              <Box
                key={q.id}
                sx={theme => ({
                  width: '25%',
                  padding: '0.5rem',
                  [theme.breakpoints.down('xl')]: {
                    width: '33%',
                  },
                  [theme.breakpoints.down('lg')]: {
                    width: '50%',
                  },
                  [theme.breakpoints.down('md')]: {
                    width: '50%',
                  },
                  [theme.breakpoints.down('sm')]: {
                    width: '100%',
                  },
                  '@media print': {
                    width: '50%',
                  },
                })}
              >
                <QuestionItem
                  question={q}
                  publicQuestionIds={publicQuestionIds}
                  disabled={!publicityConfigurableQuestionIds?.includes(q.id)}
                  isResponsibleTeacher={isResponsibleTeacher}
                  feedbackCount={feedbackCount}
                  feedbackTargetId={feedbackTargetId}
                />
              </Box>
            ))}
          </Box>
        </QuestionSection>
        <QuestionSection
          title={t('questionResults:openQuestions')}
          count={openQuestions.length}
          data-cy={`feedback-target-results-open-questions-${openQuestions.length}`}
        >
          {openQuestions.map(q => (
            <QuestionItem
              key={q.id}
              question={q}
              publicQuestionIds={publicQuestionIds}
              disabled={!publicityConfigurableQuestionIds?.includes(q.id)}
              isResponsibleTeacher={isResponsibleTeacher}
              feedbackCount={feedbackCount}
              feedbackTargetId={feedbackTargetId}
            />
          ))}
        </QuestionSection>
      </>
    )
  }
)

export default QuestionResults
