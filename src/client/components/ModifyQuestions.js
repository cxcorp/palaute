import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'

import {
  Container,
  Paper,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Checkbox,
  Button,
  Select,
  MenuItem,
} from '@material-ui/core'

import {
  getCourseQuestionsAction,
  toggleRequiredField,
  submitUpdates,
  changeTypeField,
} from '../util/redux/modifyQuestionsReducer'

const mapTypeToText = {
  CHOICE: 'Monivalinta',
  TEXT: 'Tekstikenttä',
}

const ModifyQuestions = () => {
  const courseId = useParams().id
  const history = useHistory()
  const dispatch = useDispatch()
  const questions = useSelector((state) => state.questions)

  useEffect(() => {
    dispatch(getCourseQuestionsAction(courseId))
  }, [])

  const toggleRequired = (questionIndex) => {
    dispatch(toggleRequiredField(questionIndex))
  }

  const updateQuestions = () => {
    dispatch(submitUpdates(courseId, questions.data))
    history.push('/list')
  }

  const formTableRow = (question, i) => {
    const changeType = (event) => {
      dispatch(changeTypeField(i, event.target.value))
    }

    return (
      <TableRow key={question.id}>
        <TableCell>{question.question.fi}</TableCell>
        <TableCell>Kysymys [englanti]</TableCell>
        <TableCell>Kysymys [ruotsi]</TableCell>
        <TableCell>
          <Select
            variant="outlined"
            value={question.type}
            onChange={changeType}
          >
            <MenuItem value="CHOICE">{mapTypeToText.CHOICE}</MenuItem>
            <MenuItem value="TEXT">{mapTypeToText.TEXT}</MenuItem>
          </Select>
        </TableCell>
        <TableCell>
          <Checkbox
            checked={question.required}
            onChange={() => toggleRequired(i)}
          />
        </TableCell>
      </TableRow>
    )
  }

  if (questions.pending) return null

  return (
    <>
      <Container size="md" component={Paper}>
        <h2>Kysymykset</h2>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Kysymys [suomi]</b>
              </TableCell>
              <TableCell>
                <b>Kysymys [englanti]</b>
              </TableCell>
              <TableCell>
                <b>Kysymys [ruotsi]</b>
              </TableCell>
              <TableCell>
                <b>Tyyppi</b>
              </TableCell>
              <TableCell>
                <b>Pakollinen</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.data.questions.map((question, i) =>
              formTableRow(question, i),
            )}
          </TableBody>
        </Table>
        <Button variant="contained" color="primary" onClick={updateQuestions}>
          Tallenna
        </Button>
        <Button variant="contained" color="primary" href="/list">
          Takaisin
        </Button>
      </Container>
    </>
  )
}

export default ModifyQuestions
