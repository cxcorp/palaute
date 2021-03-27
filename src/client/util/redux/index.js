import { combineReducers } from 'redux'

import { apiReducer as api, errorReducer as errors } from '@grp-toska/apina'
import form from './formReducer'

export default combineReducers({
  api,
  errors,
  form,
})
