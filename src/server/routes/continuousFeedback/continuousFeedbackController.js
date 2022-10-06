const { Router } = require('express')
const {
  ContinuousFeedback,
  FeedbackTarget,
  UserFeedbackTarget,
} = require('../../models')
const { ApplicationError } = require('../../util/customErrors')

const getFeedbacks = async (req, res) => {
  const { user, isAdmin } = req

  const feedbackTargetId = Number(req.params.id)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId: user.id,
      feedbackTargetId,
      accessStatus: 'TEACHER',
    },
  })

  if (!userFeedbackTarget && !isAdmin)
    throw new ApplicationError('Forbidden', 403)

  const continuousFeedbacks = await ContinuousFeedback.findAll({
    where: {
      feedbackTargetId,
    },
  })

  return res.send(continuousFeedbacks)
}

const submitFeedback = async (req, res) => {
  const { id: userId } = req.user

  const feedbackTargetId = Number(req.params.id)
  const { feedback } = req.body

  const feedbackTarget = await FeedbackTarget.findByPk(feedbackTargetId)

  const {
    continuousFeedbackEnabled,
    sendContinuousFeedbackDigestEmail: sendInDigestEmail,
  } = feedbackTarget

  if (!continuousFeedbackEnabled)
    throw new ApplicationError('Continuous feedback is disabled', 400)

  const feedbackCanBeGiven = await feedbackTarget.feedbackCanBeGiven()

  if (feedbackCanBeGiven)
    throw new ApplicationError('Continuous feedback is closed', 403)

  const userFeedbackTarget = await UserFeedbackTarget.findOne({
    where: {
      userId,
      feedbackTargetId,
      accessStatus: 'STUDENT',
    },
  })

  if (!userFeedbackTarget) throw new ApplicationError('Not found', 404)

  const newFeedback = await ContinuousFeedback.create({
    data: feedback,
    feedbackTargetId,
    userId,
    sendInDigestEmail,
  })

  return res.send(newFeedback)
}

const router = Router()

router.get('/:id', getFeedbacks)
router.post('/:id', submitFeedback)

module.exports = router