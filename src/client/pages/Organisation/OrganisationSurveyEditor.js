import React, { useState } from 'react'
import {
  Autocomplete,
  Alert,
  Collapse,
  Chip,
  Button,
  Box,
  Dialog,
  Grid,
  IconButton,
  Typography,
  TextField,
  DialogTitle,
} from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useFormikContext, Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { debounce } from 'lodash'

import FormikDatePicker from '../../components/common/FormikDatePicker'
import FormikTextField from '../../components/common/FormikTextField'

import apiClient from '../../util/apiClient'

const LanguageEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <Box mb={2}>
      <FormikTextField
        id={`organisation-survey-${language}-${name}`}
        name={`${name}.${language}`}
        label={t('organisationSurveys:newSurveyName')}
        fullWidth
      />
    </Box>
  )
}

const ResponsibleTeachersSelector = ({ name, ...props }) => {
  const { t } = useTranslation()
  const formikProps = useFormikContext()
  const [potentialUsers, setPotentialUsers] = useState([])

  const handleChange = debounce(async ({ target }) => {
    const query = target.value
    if (query.length < 5) return

    const params = {
      email: query,
    }

    const { data } = await apiClient.get('/users', { params })
    const { persons } = data

    setPotentialUsers(persons)
  }, 400)

  return (
    <Box>
      <Typography variant="body1" mb={2}>
        {t('organisationSurveys:responsibleTeacherTitle')}
      </Typography>

      <Autocomplete
        id={name}
        name={name}
        multiple
        fullWidth
        defaultValue={formikProps.initialValues.teachers}
        onChange={(_, teachers) => formikProps.setFieldValue('teachers', teachers)}
        options={potentialUsers}
        onInputChange={handleChange}
        getOptionLabel={option => option.email}
        renderInput={params => <TextField {...params} />}
        {...props}
      />
    </Box>
  )
}

const StudentNumberInput = ({ name, ...props }) => {
  const { t } = useTranslation()
  const formikProps = useFormikContext()
  const [expand, setExpand] = useState(false)
  const [value, setValue] = React.useState(formikProps.initialValues.studentNumbers)
  const [inputValue, setInputValue] = React.useState('')

  const hasError = formikProps.touched[name] && formikProps.errors[name]
  const errorText = formikProps.errors[name]?.text
  const errorData = formikProps.errors[name]?.data

  return (
    <Box>
      <Typography variant="body1" mb={2}>
        {t('organisationSurveys:studentNumberTitle')}
      </Typography>

      <Box my={2}>
        <Alert severity="info">
          <Box sx={{ display: 'flex', alignItems: 'center', mt: -1 }}>
            <Typography variant="body2">{t('organisationSurveys:studentNumberInformation')}</Typography>

            <IconButton onClick={() => setExpand(!expand)}>{!expand ? <ExpandMore /> : <ExpandLess />}</IconButton>
          </Box>

          <Collapse in={expand} timeout="auto" unmountOnExit>
            <ul>
              <li>{t('organisationSurveys:studentNumberDelimeters:comma')}</li>
              <li>{t('organisationSurveys:studentNumberDelimeters:semicolon')}</li>
              <li>{t('organisationSurveys:studentNumberDelimeters:space')}</li>
              <li>{t('organisationSurveys:studentNumberDelimeters:newline')}</li>
            </ul>
            <Typography variant="body2" mt={2}>
              {t('organisationSurveys:studentNumberExampleInput')}
            </Typography>
            <Box sx={{ background: 'white', maxWidth: 480, p: 1, border: 1, borderRadius: 1 }} component="pre">
              010000003;
              <br />
              011000002,
              <br />
              011000090 011000003
            </Box>
          </Collapse>
        </Alert>
      </Box>

      <Autocomplete
        id={name}
        name={name}
        multiple
        fullWidth
        clearOnBlur
        options={[]}
        freeSolo
        value={value}
        inputValue={inputValue}
        onChange={(_, studentNumbers) => {
          setValue(studentNumbers)
          formikProps.setFieldValue('studentNumbers', studentNumbers)
        }}
        onInputChange={(_, newInputValue) => {
          const options = newInputValue.split(/[,\n; ]/)

          if (options.length > 1) {
            const studentNumbers = value
              .concat(options)
              .filter(v => v)
              .map(v => (v.length >= 9 ? v : `0${v}`))

            setValue(studentNumbers)
            formikProps.setFieldValue('studentNumbers', studentNumbers)
          } else {
            setInputValue(newInputValue)
          }
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option}
              variant="outlined"
              label={option}
              color={formikProps.errors[name] && errorData.includes(option) ? 'error' : 'primary'}
            />
          ))
        }
        renderInput={params => (
          <TextField {...params} error={Boolean(hasError)} helperText={hasError ? errorText : ''} />
        )}
        {...props}
      />
    </Box>
  )
}

const OrganisationSurveyForm = ({ languages = ['fi', 'sv', 'en'] }) => {
  const { t } = useTranslation()

  return (
    <Grid spacing={4} container>
      {languages.map(language => (
        <Grid md={4} sm={12} xs={12} item key={language}>
          <Box mb={2}>
            <Typography variant="h6" component="h2">
              {language.toUpperCase()}
            </Typography>
          </Box>

          <LanguageEditor name="name" language={language} />
        </Grid>
      ))}
      <Grid md={6} sm={12} xs={12} item>
        <FormikDatePicker name="startDate" label={t('organisationSurveys:startDate')} />
      </Grid>
      <Grid md={6} sm={12} xs={12} item>
        <FormikDatePicker name="endDate" label={t('organisationSurveys:endDate')} />
      </Grid>
      <Grid xs={12} item>
        <ResponsibleTeachersSelector name="teacherIds" label={t('organisationSurveys:responsibleTeacherEmail')} />
      </Grid>
      <Grid xs={12} item>
        <StudentNumberInput name="studentNumbers" label={t('organisationSurveys:studentNumberInputLabel')} />
      </Grid>
    </Grid>
  )
}

const OrganisationSurveyEditor = ({ title, initialValues, validationSchema, handleSubmit, editing, onStopEditing }) => {
  const { t } = useTranslation()

  return (
    <Dialog maxWidth={false} open={editing} onClose={onStopEditing}>
      <DialogTitle>{title}</DialogTitle>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validationSchema={validationSchema}
      >
        {({ isSubmitting }) => {
          const disabled = isSubmitting

          return (
            <Form>
              <Box sx={{ m: 4 }}>
                <OrganisationSurveyForm />

                <Box sx={{ mt: 2 }}>
                  <Button disabled={disabled} color="primary" variant="contained" type="submit">
                    {t('common:save')}
                  </Button>
                  <Button sx={{ ml: 4 }} color="error" variant="contained" type="button" onClick={onStopEditing}>
                    {t('common:cancel')}
                  </Button>
                </Box>
              </Box>
            </Form>
          )
        }}
      </Formik>
    </Dialog>
  )
}

export default OrganisationSurveyEditor
