import {createStore, applyMiddleware} from 'redux'
import createSagaMiddleware from 'redux-saga'
import rootReducer from '../reducers/rootReducer.js'
import {loadState} from '../util/localStorage'

const persistedState = loadState();

export default function configureStore() {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(rootReducer, persistedState, applyMiddleware(sagaMiddleware));

  return {
    ...store
  }
}
