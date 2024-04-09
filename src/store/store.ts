import { configureStore } from '@reduxjs/toolkit'
import configurationReducer from './features/featureslice'
import storage from "redux-persist/lib/storage";
import{persistReducer} from "redux-persist"
import { combineReducers  } from '@reduxjs/toolkit';


const persistConfig = {
  key: 'root',
  storage,
};

const reducer = combineReducers({
  configuration: configurationReducer,

})

const persistedReducer = persistReducer(persistConfig, reducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch