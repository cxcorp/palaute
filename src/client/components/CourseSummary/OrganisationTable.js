/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react'
/** @jsxImportSource @emotion/react */

import {
  TableContainer,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material'
import { Search, SettingsOutlined } from '@mui/icons-material'

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import CourseUnitSummary from './CourseUnitSummary'
import DividerRow from './DividerRow'

import { getAccess } from './utils'
import ColumnHeadings from './ColumnHeadings'
import { OrganisationLabel } from './Labels'
import HiddenRows from './HiddenRows'

const styles = {
  filtersCell: {
    verticalAlign: 'bottom',
    width: '450px',
    padding: '0 1rem 1rem 1rem',
  },
  progressCell: {
    paddingTop: '1rem',
    paddingBottom: '1rem',
    minHeight: '12px',
  },
  settingsButton: {
    '&:hover': {
      color: (theme) => theme.palette.primary.light,
      background: 'transparent',
    },
  },
}

const OrganisationButton = ({ code, access }) => {
  const { t } = useTranslation()
  if (!access) return null
  const { write } = access

  return (
    <Tooltip
      title={t(
        write
          ? 'courseSummary:programmeSettings'
          : 'courseSummary:programmeSummary',
      )}
      placement="top"
    >
      <IconButton
        id={`settings-button-${code}`}
        component={Link}
        to={`/organisations/${code}/${write ? 'settings' : 'summary'}`}
        size="large"
        sx={styles.settingsButton}
        color="primary"
        disableFocusRipple
      >
        {write ? (
          <SettingsOutlined sx={{ fontSize: '26px' }} />
        ) : (
          <Search sx={{ fontSize: '24px' }} />
        )}
      </IconButton>
    </Tooltip>
  )
}

const OrganisationTable = ({
  organisations,
  questions,
  organisationAccess,
  initialOpenAccordions = [],
  onToggleAccordion = () => {},
  onOrderByChange,
  filters,
  loading = false,
  organisationLinks = false,
}) => {
  const { t, i18n } = useTranslation()
  const showHidingModeButton =
    organisationAccess?.length > 1 && organisations.length > 1

  return (
    <TableContainer sx={{ overflow: 'visible' }}>
      <table>
        <thead>
          <tr>
            <th css={styles.filtersCell}>{filters}</th>

            <ColumnHeadings
              onOrderByChange={onOrderByChange}
              questionNames={questions
                .map(({ id, data }) => ({
                  id,
                  question: getLanguageValue(data?.label, i18n.language),
                }))
                .concat([
                  { id: 0, question: t('courseSummary:feedbackCount') },
                  { id: 1, question: t('courseSummary:feedbackPercentage') },
                  { id: 2, question: t('courseSummary:feedbackResponse') },
                ])}
            />
            <th />
            {showHidingModeButton && (
              <th>
                <HiddenRows />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={99} css={styles.progressCell}>
                <LinearProgress />
              </td>
            </tr>
          )}

          {!loading &&
            organisations.map(
              ({
                code,
                id,
                name,
                results,
                feedbackCount,
                courseUnits,
                studentCount,
                feedbackResponsePercentage,
              }) => (
                <React.Fragment key={id}>
                  <ResultsRow
                    id={id}
                    label={
                      <OrganisationLabel
                        name={getLanguageValue(name, i18n.language)}
                        code={code}
                      />
                    }
                    results={results}
                    questions={questions}
                    feedbackCount={feedbackCount}
                    studentCount={studentCount}
                    feedbackResponsePercentage={feedbackResponsePercentage}
                    accordionEnabled={courseUnits.length > 0}
                    accordionInitialOpen={initialOpenAccordions.includes(id)}
                    onToggleAccordion={() => onToggleAccordion(id)}
                    cellsAfter={
                      organisationLinks && (
                        <td css={{ paddingLeft: '2rem' }}>
                          <OrganisationButton
                            code={code}
                            access={getAccess(id, organisationAccess)}
                          />
                        </td>
                      )
                    }
                  >
                    <CourseUnitSummary
                      courseUnits={courseUnits}
                      questions={questions}
                    />
                  </ResultsRow>
                  <DividerRow height={1.3} />
                </React.Fragment>
              ),
            )}
        </tbody>
      </table>
    </TableContainer>
  )
}

export default OrganisationTable