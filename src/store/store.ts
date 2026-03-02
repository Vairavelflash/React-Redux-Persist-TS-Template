import { configureStore } from '@reduxjs/toolkit'
import configurationReducer from './features/featureslice'
import storage from "redux-persist/lib/storage";
import{persistReducer} from "redux-persist"
import { combineReducers  } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { fakeApi } from '../services/fakeAPI';


const persistConfig = {
  key: 'root',
  storage,
};

const reducer = combineReducers({
  configuration: configurationReducer,
  [fakeApi.reducerPath]: fakeApi.reducer
})

const persistedReducer = persistReducer(persistConfig, reducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(fakeApi.middleware),
})

setupListeners(store.dispatch)
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch