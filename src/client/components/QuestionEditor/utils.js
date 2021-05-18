import { v4 as uuidv4 } from 'uuid'
import apiClient from '../../util/apiClient'

const TEMP_ID = Symbol('tempId')

const createTranslationObject = () => ({
  fi: '',
  sv: '',
  en: '',
})

const createQuestionData = (type) => {
  switch (type) {
    case 'LIKERT':
      return {
        label: createTranslationObject(),
      }
    case 'MULTIPLE_CHOICE':
      return {
        label: createTranslationObject(),
        options: [],
      }
    case 'SINGLE_CHOICE':
      return {
        label: createTranslationObject(),
        options: [],
      }
    case 'OPEN':
      return {
        label: createTranslationObject(),
      }
    case 'TEXT':
      return {
        content: createTranslationObject(),
      }
    default:
      return null
  }
}

export const getQuestionId = (question) => question.id ?? question[TEMP_ID]

export const createQuestion = (type) => {
  const data = createQuestionData(type)

  return {
    [TEMP_ID]: uuidv4(),
    type,
    data,
    required: false,
  }
}

export const createOption = () => ({
  id: uuidv4(),
  label: createTranslationObject(),
})

export const saveQuestion = async (values, feedbackTarget) => {
  const { questions } = values

  const { surveys, id } = feedbackTarget
  const { id: surveyId } = surveys.teacherSurvey

  const payload = {
    surveyId,
    questions,
  }

  const { data } = await apiClient.put(`/feedback-targets/${id}`, payload)

  return data
}
