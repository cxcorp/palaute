import React from 'react'
import { Box, IconButton, MenuItem, Select, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getStudyYearRange, useYearSemesters } from '../../util/yearSemesterUtils'
import { STUDY_YEAR_START_MONTH } from '../../util/common'

const styles = {
  stepper: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    minHeight: '70px',
  },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '4px',
    paddingRight: '4px',
    marginBottom: '4px',
  },
  selectorContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '1.5rem',
  },
  stepperValue: {
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  button: {
    color: theme => theme.palette.info.main,
    '&:hover': {
      background: theme => theme.palette.action.hover,
      color: theme => theme.palette.text.primary,
    },
    '&:active': {
      background: theme => theme.palette.action.selected,
    },
    marginX: '0.4rem',
  },
  disabledButton: {
    opacity: '0.0',
    zIndex: -10,
  },
}

const YearStepper = ({ value, onChange }) => {
  const handleIncrease = () => {
    onChange(value + 1)
  }

  const handleDecrease = () => {
    onChange(value - 1)
  }

  const now = new Date()
  const currentYear = now.getFullYear() + (now.getMonth() + 1 >= STUDY_YEAR_START_MONTH ? 1 : 0)

  const displayValue = `${value} – ${value + 1}`

  const canIncrease = value + 1 < currentYear
  const canDecrease = value > 2020

  return (
    <Box sx={styles.stepperContainer}>
      <IconButton
        onClick={handleDecrease}
        disabled={!canDecrease}
        sx={[!canDecrease ? styles.disabledButton : {}, styles.button]}
        size="small"
        disableTouchRipple
      >
        <ChevronLeft fontSize="large" />
      </IconButton>
      <Typography sx={styles.stepperValue}>{displayValue}</Typography>
      <IconButton
        onClick={handleIncrease}
        disabled={!canIncrease}
        sx={[!canIncrease ? styles.disabledButton : {}, styles.button]}
        size="small"
        disableTouchRipple
      >
        <ChevronRight fontSize="large" />
      </IconButton>
    </Box>
  )
}

const SemesterSelector = ({ value, onChange, semesters }) => {
  const { t } = useTranslation()

  return (
    <Box sx={styles.selectorContainer}>
      <Select value={value} onChange={event => onChange(event.target.value)}>
        {semesters.map(s => (
          <MenuItem value={s} key={s.start}>
            {`${s.start.getFullYear()} ${s.spring ? t('courseSummary:spring') : t('courseSummary:fall')}`}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}

/**
 *
 * @param {{
 * 	value: { start: Date, end: Date },
 * 	onChange: ({ start: Date, end: Date }) => (),
 * }} params
 * @returns
 */
export const YearSemesterSelector = ({ value, onChange, option, setOption, allowAll }) => {
  const { t } = useTranslation()
  const { year, semesters, currentSemester } = useYearSemesters(value?.start ?? new Date())

  const handleYearChange = year => {
    const range = getStudyYearRange(new Date(`${year + 1}-01-01`))
    onChange(range)
  }

  const handleSemesterChange = ({ start, end }) => {
    onChange({ start, end })
  }

  const handleOptionChange = event => {
    if (event.target.value === 'year') {
      handleYearChange(year)
    } else {
      handleSemesterChange(currentSemester)
    }
    setOption(event.target.value)
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={event => event.stopPropagation()}>
      <Box sx={styles.stepper}>
        <ToggleButtonGroup value={option} onChange={handleOptionChange} color="primary">
          {allowAll && <ToggleButton value="all">{t('courseSummary:all')}</ToggleButton>}
          <ToggleButton value="year">{t('courseSummary:year')}</ToggleButton>
          <ToggleButton value="semester">{t('courseSummary:semester')}</ToggleButton>
        </ToggleButtonGroup>
        {option !== 'all' && (
          <Box>
            {option === 'year' ? (
              <YearStepper value={year} onChange={handleYearChange} />
            ) : (
              <SemesterSelector value={currentSemester} onChange={handleSemesterChange} semesters={semesters} />
            )}
          </Box>
        )}
      </Box>
    </div>
  )
}
