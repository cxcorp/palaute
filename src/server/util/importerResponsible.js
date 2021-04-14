const dateFns = require('date-fns')

const importerClient = require('./importerClient')

const { FeedbackTarget, CourseUnit, UserFeedbackTarget } = require('../models')
const logger = require('./logger')
// const { Question } = require('../models')

// const defaultQuestions = require('./questions.json')

const formatDate = (date) => dateFns.format(date, 'yyyy-MM-dd')

const acceptedItemTypes = [
  'urn:code:assessment-item-type:teaching-participation',
]

const createCourseUnit = async (data) => {
  await CourseUnit.upsert({
    id: data.id,
    name: data.name,
  })
}

const createFeedbackTargetWithUserTargetTable = async (upsertData, userId) => {
  const [feedbackTarget] = await FeedbackTarget.upsert(upsertData)
  await UserFeedbackTarget.findOrCreate({
    where: {
      userId,
      feedbackTargetId: Number(feedbackTarget.id),
    },
    defaults: {
      accessStatus: 'TEACHER',
      userId,
      feedbackTargetId: Number(feedbackTarget.id),
    },
  })
  return feedbackTarget
}

const createFeedbackTargetFromAssessmentItem = async (
  data,
  endDate,
  userId,
) => {
  await createCourseUnit(data.courseUnit)
  const target = await createFeedbackTargetWithUserTargetTable(
    {
      feedbackType: 'assessmentItem',
      typeId: data.id,
      courseUnitId: data.courseUnit.id,
      name: data.name,
      opensAt: formatDate(dateFns.subDays(endDate, 14)),
      closesAt: formatDate(dateFns.addDays(endDate, 14)),
    },
    userId,
  )
  return target
}

const createFeedbackTargetFromStudyGroup = async (
  data,
  endDate,
  courseUnitId,
  userId,
) => {
  const target = await createFeedbackTargetWithUserTargetTable(
    {
      feedbackType: 'studySubGroup',
      typeId: data.id,
      courseUnitId,
      name: data.name,
      opensAt: formatDate(dateFns.subDays(endDate, 14)),
      closesAt: formatDate(dateFns.addDays(endDate, 14)),
    },
    userId,
  )
  return target
}

const createFeedbackTargetFromCourseRealisation = async (
  data,
  assessmentIdToItem,
  shouldCreateTarget,
  userId,
) => {
  const endDate = dateFns.parse(
    data.activityPeriod.endDate,
    'yyyy-MM-dd',
    new Date(),
  )
  const assessmentItems = await Promise.all(
    data.assessmentItemIds.map(async (id) => {
      if (shouldCreateTarget.has(id)) {
        return createFeedbackTargetFromAssessmentItem(
          assessmentIdToItem.get(id),
          endDate,
          userId,
        )
      }
      await createCourseUnit(assessmentIdToItem.get(id).courseUnit)
      return { courseUnitId: assessmentIdToItem.get(id).courseUnit.id }
    }),
  )
  const ids = assessmentItems.map((item) => item.courseUnitId)
  if (!ids.every((id) => id === ids[0])) {
    logger.info(
      'AssessmentItems have differing course unit ids!',
      assessmentItems,
    )
  }
  const studySubGroupItems = (
    await Promise.all(
      data.studyGroupSets.map(async (studySet) => {
        const studySetItems = await Promise.all(
          studySet.studySubGroups.map(async (item) =>
            createFeedbackTargetFromStudyGroup(item, endDate, ids[0], userId),
          ),
        )
        return studySetItems
      }),
    )
  ).flat()
  const course = await createFeedbackTargetWithUserTargetTable(
    {
      feedbackType: 'courseRealisation',
      typeId: data.id,
      courseUnitId: ids[0],
      name: data.name,
      opensAt: formatDate(dateFns.subDays(endDate, 14)),
      closesAt: formatDate(dateFns.addDays(endDate, 14)),
    },
    userId,
  )
  assessmentItems.push(course)
  assessmentItems.push(...studySubGroupItems)
  return assessmentItems.filter((item) => item.id)
}

const getAssessmentItemIdsFromCompletionMethods = (data) => {
  const ids = new Set()

  data.forEach((method) => {
    method.assessmentItemIds.forEach((id) => ids.add(id))
  })

  return ids
}

const getResponsibleByPersonId = async (personId, options = {}) => {
  const { startDateBefore, endDateAfter } = options

  const params = {
    ...(startDateBefore && { startDateBefore: formatDate(startDateBefore) }),
    ...(endDateAfter && { endDateAfter: formatDate(endDateAfter) }),
  }

  const { data } = await importerClient.get(
    `/palaute/responsible/${personId}`,
    {
      params,
    },
  )

  const { courseUnitRealisations, assessmentItems } = data

  // Mankelin idea
  // Aloita realisaatioista, joiden assessmentItemIds-taulusta tallennat kaikki itemit
  // AssessmentItemin kautta saadaan ja tallennetaan courseUnit,
  // jonka tietoja käytetään myös realisaatioissa.
  // Tehokkuuden vuoksi luodaan hakemisto, jolla saadaan assessmentItemit tehokkaasti.

  const filteredAssessmentItems = assessmentItems
    .filter((item) => acceptedItemTypes.includes(item.assessmentItemType))
    .filter((item) =>
      getAssessmentItemIdsFromCompletionMethods(
        item.courseUnit.completionMethods,
      ).has(item.id),
    )

  const assessmentIdToItem = new Map()
  const shouldCreateTarget = new Set()

  filteredAssessmentItems.forEach((item) => {
    shouldCreateTarget.add(item.id)
  })

  assessmentItems.forEach((item) => {
    assessmentIdToItem.set(item.id, item)
  })

  return (
    await Promise.all(
      courseUnitRealisations.map(async (realisation) =>
        createFeedbackTargetFromCourseRealisation(
          realisation,
          assessmentIdToItem,
          shouldCreateTarget,
          personId,
        ),
      ),
    )
  ).flat()
}

module.exports = {
  getResponsibleByPersonId,
}
