const _ = require('lodash')
const { Summary, Organisation, CourseUnit, CourseRealisation, FeedbackTarget } = require('../../models')
const { sumSummaryDatas } = require('./summaryUtils')

const getOrganisationSummaryWithChildren = async ({ organisationId, startDate, endDate }) => {
  const rootOrganisation = await Organisation.findByPk(organisationId, {
    attributes: ['name', 'id', 'code'],
    include: [
      {
        model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
        as: 'summary',
        required: true,
      },
      {
        model: Organisation,
        as: 'childOrganisations',
        attributes: ['name', 'id', 'code'],
        include: {
          model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
          as: 'summary',
          required: true,
        },
      },
      {
        model: CourseUnit,
        as: 'courseUnits',
        attributes: ['name', 'id', 'courseCode'],
        through: { attributes: [] },
        include: {
          model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
          as: 'summary',
          required: true,
        },
      },
      {
        model: CourseRealisation,
        as: 'courseRealisations',
        attributes: ['id'],
        through: { attributes: [] },
        include: [
          {
            model: Summary.scope('defaultScope', { method: ['between', startDate, endDate] }),
            as: 'summary',
            required: true,
          },
          {
            model: FeedbackTarget,
            as: 'feedbackTargets',
            attributes: ['id'],
            required: true,
            include: {
              model: CourseUnit,
              as: 'courseUnit',
              attributes: ['name', 'id', 'courseCode'],
              required: true,
            },
          },
        ],
      },
    ],
  })

  // Mangeling to do: we dont want to show individual CURs under organisation.
  // Instead, construct partial CUs from them.
  const { courseRealisations } = rootOrganisation
  // First remove those CURs whose CU already exists under this organisation
  const partiallyResponsibleCourseRealisations = courseRealisations.filter(
    cur => !rootOrganisation.courseUnits.some(cu => cur.feedbackTargets[0].courseUnit.id === cu.id)
  )

  // Group course realisations by associated course unit
  const groupedPartialCourseUnits = _.groupBy(
    partiallyResponsibleCourseRealisations,
    cur => cur.feedbackTargets[0].courseUnit.id
  )
  // Now aggregate course units
  const partialCourseUnits = Object.entries(groupedPartialCourseUnits).map(([courseUnitId, courseRealisations]) => {
    const summaryData = sumSummaryDatas(courseRealisations.map(cur => cur.summary.data))
    const { courseUnit } = groupedPartialCourseUnits[courseUnitId][0].feedbackTargets[0]

    return {
      id: courseUnitId,
      name: courseUnit.name,
      courseCode: courseUnit.courseCode,
      summary: {
        data: summaryData,
      },
    }
  })

  const organisation = rootOrganisation.toJSON()

  // Add partial course units to list
  organisation.courseUnits = rootOrganisation.courseUnits.concat(partialCourseUnits)
  // These we dont need.
  delete organisation.courseRealisations

  return organisation
}

module.exports = {
  getOrganisationSummaryWithChildren,
}
