import React from 'react'
/** @jsxImportSource @emotion/react */

import { Switch, useRouteMatch, useParams, Redirect } from 'react-router-dom'

import { Box, Typography, Button, Alert, List, ListItem } from '@mui/material'
import { grey } from '@mui/material/colors'

import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import CopyIcon from '@mui/icons-material/FileCopyOutlined'
import {
  EditOutlined,
  ListOutlined,
  LiveHelpOutlined,
  PeopleOutlined,
  PollOutlined,
  ShareOutlined,
  ReviewsOutlined,
} from '@mui/icons-material'

import Results from './tabs/Results'
import FeedbackView from './tabs/FeedbackView'
import StudentsWithFeedback from './tabs/StudentsWithFeedback'
import EditFeedbackResponse from './tabs/EditFeedbackResponse'
import Share from './tabs/Share'
import Links from './tabs/Links'
import Settings from './tabs/Settings'
import Logs from './tabs/Logs'
import ContinuousFeedback from './tabs/ContinuousFeedback'

import useCourseRealisationSummaries from '../../hooks/useCourseRealisationSummaries'
import { RouterTab } from '../../components/common/RouterTabs'
import { getLanguageValue } from '../../util/languageUtils'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import feedbackTargetIsOld from '../../util/feedbackTargetIsOld'

import { copyLink, getCourseUnitSummaryPath, deleteResponsibleTeacher } from './utils'

import TeacherChip from '../../components/common/TeacherChip'
import PercentageCell from '../CourseSummary/PercentageCell'
import { TagChip } from '../../components/common/TagChip'
import { useFeedbackTargetContext } from './FeedbackTargetContext'
import ErrorView from '../../components/common/ErrorView'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import LinkButton from '../../components/common/LinkButton'
import Title from '../../components/common/Title'
import { TabGroup, TabGroupsContainer } from '../../components/common/TabGroup'
import Dates from './Dates/Dates'

const styles = {
  datesContainer: {
    display: 'grid',
    gridGap: '0.2rem',
    gridTemplateColumns: 'auto 1fr',
    '& dt': {
      paddingRight: 3,
      gridColumn: 1,
    },
    '& dd': {
      gridColumn: 2,
    },
  },
  headingContainer: theme => ({
    display: 'flex',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
  }),
  copyLinkButtonContainer: theme => ({
    paddingLeft: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
      paddingTop: theme.spacing(1),
    },
    '@media print': {
      display: 'none',
    },
  }),
  infoContainer: theme => ({
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  }),
  teacherListContainer: {
    padding: 0,
    maxHeight: '100px',
    maxWidth: '150px',
    overflowX: 'hidden',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-track': {
      background: grey[200],
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb': {
      background: grey[400],
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: grey[500],
    },
    '@media print': {
      overflow: 'visible',
      maxHeight: '100%',
      height: 'auto',
    },
  },
  linkContainer: {
    pb: '0.8rem',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: '0.4rem',
    columnGap: '0.7rem',
  },
  hidePrint: {
    '@media print': {
      display: 'none',
    },
  },
}

const TeachersList = ({ teachers, isAdmin, onDelete }) => (
  <List sx={styles.teacherListContainer}>
    {teachers.map(teacher => (
      <ListItem key={teacher.id} disablePadding>
        <TeacherChip user={teacher} onDelete={isAdmin ? () => onDelete(teacher) : undefined} />
      </ListItem>
    ))}
  </List>
)

// TODO rewrite this shit as mutation
const handleDeleteTeacher = (feedbackTarget, t) => async teacher => {
  const displayName = `${teacher.firstName} ${teacher.lastName}`

  const message = t('feedbackTargetView:deleteTeacherConfirmation', {
    name: displayName,
  })

  // eslint-disable-next-line no-alert
  if (window.confirm(message)) {
    try {
      await deleteResponsibleTeacher(feedbackTarget, teacher)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }
}

const FeedbackTargetContent = () => {
  const { path, url } = useRouteMatch()
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { feedbackTarget, organisation, isStudent, isTeacher, isAdmin, isOrganisationAdmin, isResponsibleTeacher } =
    useFeedbackTargetContext()

  // If link to cur summary should not be shown, gets empty response when failSilentry: true
  const { courseRealisationSummaries: showCourseSummaryLink } = useCourseRealisationSummaries(
    feedbackTarget.courseUnit.courseCode,
    {
      failSilently: true,
      enabled: isTeacher,
    }
  )

  const {
    courseUnit,
    courseRealisation,
    feedback,
    administrativePersons,
    responsibleTeachers,
    teachers,
    feedbackResponseEmailSent,
    settingsReadByTeacher,
    feedbackCount,
    studentCount,
    continuousFeedbackCount,
    continuousFeedbackEnabled,
    feedbackCanBeGiven,
  } = feedbackTarget

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isOld = feedbackTargetIsOld(feedbackTarget)

  const showResultsSection = isAdmin || isOrganisationAdmin || isTeacher || feedback || isEnded
  const showContinuousFeedbackTab = continuousFeedbackEnabled || isOrganisationAdmin || isResponsibleTeacher
  const showEditFeedbackResponseTab = (isOrganisationAdmin || isResponsibleTeacher) && isEnded && !isOld
  const showStudentsWithFeedbackTab = isAdmin || ((isOrganisationAdmin || isResponsibleTeacher) && (isOpen || isEnded))
  const showLinksTab = isOrganisationAdmin || isTeacher
  const showSettingsTab = isOrganisationAdmin || isResponsibleTeacher

  const showTags = feedbackTarget?.tags?.length > 0
  const coursePageUrl = `${t('links:courseRealisationPage')}${courseRealisation.id}`
  const courseSummaryPath = getCourseUnitSummaryPath(feedbackTarget)
  const courseRealisationName = getLanguageValue(courseRealisation?.name, i18n.language)
  const visibleCourseCode = courseRealisationName.indexOf(courseUnit?.courseCode) > -1 ? '' : courseUnit?.courseCode
  const courseUnitName = getLanguageValue(courseUnit?.name, i18n.language)
  const title = `${visibleCourseCode} ${courseUnitName}`

  if (!feedbackCanBeGiven && !isTeacher) {
    return <ErrorView message={t('feedbackTargetView:feedbackDisabled')} />
  }

  const handleCopyLink = () => {
    const link = `https://${window.location.host}/targets/${id}/feedback`
    copyLink(link)
    enqueueSnackbar(`${t('feedbackTargetView:linkCopied')}: ${link}`, {
      variant: 'info',
    })
  }

  return (
    <>
      <Title>{title}</Title>
      <Box mb={2}>
        {!feedbackCanBeGiven && <Alert severity="error">{t('feedbackTargetView:feedbackDisabled')}</Alert>}
        <div css={styles.headingContainer}>
          <Box display="flex" flexDirection="column" gap="1rem">
            <Box display="flex" flexWrap="wrap" alignItems="end" columnGap="1rem" rowGap="0.3rem">
              <Typography variant="h4" component="h1">
                {courseUnitName}
              </Typography>
              <Typography variant="h5" color="textSecondary">
                {visibleCourseCode}
              </Typography>
              {isTeacher && (
                <Button startIcon={<CopyIcon />} color="primary" onClick={handleCopyLink}>
                  {t('feedbackTargetView:copyLink')}
                </Button>
              )}
            </Box>
            <Box display="flex" flexDirection="row" flexWrap="wrap" alignItems="center">
              <Typography variant="body1" component="h2" sx={{ mr: '1rem' }}>
                {courseRealisationName}
              </Typography>
              {showTags && feedbackTarget.tags.map(tag => <TagChip key={tag.id} tag={tag} language={i18n.language} />)}
            </Box>
          </Box>
        </div>

        <Box sx={[styles.linkContainer, styles.hidePrint]}>
          {organisation && (
            <LinkButton
              to={`/organisations/${organisation.code}`}
              title={getLanguageValue(organisation.name, i18n.language)}
            />
          )}

          {isTeacher && showCourseSummaryLink && (
            <LinkButton to={courseSummaryPath} title={t('feedbackTargetView:courseSummary')} />
          )}

          <LinkButton to={coursePageUrl} title={t('feedbackTargetView:coursePage')} external />

          {isTeacher && <LinkButton to={t('links:wikiTeacherHelp')} title={t('footer:wikiLink')} external />}
        </Box>

        <Box sx={styles.infoContainer}>
          <Dates />

          {isResponsibleTeacher && (
            <Box mt="1rem" mr="3rem">
              <Typography gutterBottom>{t('feedbackTargetView:studentsWithFeedbackTab')}</Typography>
              <Box display="flex">
                <PercentageCell
                  label={`${feedbackCount}/${studentCount}`}
                  percent={(feedbackCount / studentCount) * 100}
                />
              </Box>
            </Box>
          )}

          {!!responsibleTeachers.length && (
            <Box mt="1rem" ml="1rem">
              <Typography gutterBottom>{t('feedbackTargetView:responsibleTeachers')}</Typography>
              <TeachersList
                teachers={responsibleTeachers}
                isAdmin={isAdmin}
                onDelete={handleDeleteTeacher(feedbackTarget, t)}
              />
            </Box>
          )}

          {!!teachers.length && (
            <Box mt="1rem" ml="1rem">
              <Typography gutterBottom>{t('feedbackTargetView:teachers')}</Typography>
              <TeachersList teachers={teachers} isAdmin={isAdmin} onDelete={handleDeleteTeacher(feedbackTarget, t)} />
            </Box>
          )}

          {!isStudent && !!administrativePersons.length && (
            <Box mt="1rem" ml="1rem">
              <Typography gutterBottom>{t('feedbackTargetView:administrativePersons')}</Typography>
              <TeachersList
                teachers={administrativePersons}
                isAdmin={isAdmin}
                onDelete={handleDeleteTeacher(feedbackTarget, t)}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Box mb="2rem" sx={styles.hidePrint}>
        <TabGroupsContainer>
          <TabGroup title={t('common:survey')} hideTitle={isStudent}>
            {feedback && isOpen ? (
              <RouterTab
                label={t('feedbackTargetView:editFeedbackTab')}
                to={`${url}/feedback`}
                icon={<EditOutlined />}
              />
            ) : (
              <RouterTab
                label={isStudent ? t('feedbackTargetView:surveyTab') : t('common:preview')}
                to={`${url}/feedback`}
                badge={isOpen}
                icon={<LiveHelpOutlined />}
              />
            )}
            {showSettingsTab && (
              <RouterTab
                label={t('feedbackTargetView:surveySettingsTab')}
                to={`${url}/edit`}
                badge={!settingsReadByTeacher}
                icon={<EditOutlined />}
              />
            )}
            {showContinuousFeedbackTab && (
              <RouterTab
                label={t('feedbackTargetView:continuousFeedbackTab')}
                to={`${url}/continuous-feedback`}
                badge={continuousFeedbackCount}
                badgeContent={continuousFeedbackCount}
                badgeColor="grey"
                icon={<ReviewsOutlined />}
              />
            )}
            {showEditFeedbackResponseTab && (
              <RouterTab
                label={t('feedbackTargetView:editFeedbackResponseTab')}
                to={`${url}/edit-feedback-response`}
                badge={!feedbackResponseEmailSent}
                icon={<EditOutlined />}
              />
            )}
            {showLinksTab && (
              <RouterTab label={t('feedbackTargetView:shareTab')} to={`${url}/share`} icon={<ShareOutlined />} />
            )}
          </TabGroup>

          {showResultsSection && (
            <TabGroup title={t('feedbackTargetView:results')} hideTitle={isStudent}>
              <RouterTab label={t('feedbackTargetView:feedbacksTab')} to={`${url}/results`} icon={<PollOutlined />} />
              {showStudentsWithFeedbackTab && (
                <RouterTab
                  label={t('feedbackTargetView:studentsWithFeedbackTab')}
                  to={`${url}/students-with-feedback`}
                  icon={<PeopleOutlined />}
                />
              )}
            </TabGroup>
          )}

          {isAdmin && (
            <TabGroup title="Admin">
              <RouterTab label="Togen" to={`${url}/togen`} icon={<ListOutlined />} />
              <RouterTab label="Logs" to={`${url}/logs`} icon={<ListOutlined />} />
            </TabGroup>
          )}
        </TabGroupsContainer>
      </Box>

      <Switch>
        <ProtectedRoute path={`${path}/edit`} component={Settings} hasAccess={showSettingsTab} redirectPath={path} />
        <ProtectedRoute
          path={`${path}/results`}
          component={Results}
          hasAccess={showResultsSection}
          redirectPath={path}
        />
        <ProtectedRoute path={`${path}/feedback`} component={FeedbackView} hasAccess />
        <ProtectedRoute
          path={`${path}/continuous-feedback`}
          component={ContinuousFeedback}
          hasAccess={showContinuousFeedbackTab}
          redirectPath={path}
        />
        <ProtectedRoute
          path={`${path}/students-with-feedback`}
          component={StudentsWithFeedback}
          hasAccess={showStudentsWithFeedbackTab}
          redirectPath={path}
        />
        <ProtectedRoute path={`${path}/share`} component={Share} hasAccess={showLinksTab} redirectPath={path} />
        <ProtectedRoute path={`${path}/togen`} component={Links} hasAccess={isAdmin} redirectPath={path} />
        <ProtectedRoute
          path={`${path}/edit-feedback-response`}
          redirectPath={path}
          component={EditFeedbackResponse}
          hasAccess={showEditFeedbackResponseTab}
        />
        <ProtectedRoute path={`${path}/logs`} component={Logs} hasAccess={isAdmin} redirectPath={path} />
        <Redirect to={`${path}/feedback`} />
      </Switch>
    </>
  )
}

export default FeedbackTargetContent
