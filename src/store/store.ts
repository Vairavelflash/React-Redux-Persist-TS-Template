import { combineReducers, configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import { leagueReducer } from '../features/league/leagueSlice';
import { seasonReducer } from '../features/season/seasonSlice';
import { coachReducer } from '../features/coach/coachSlice';
import { uiReducer } from '../features/ui/uiSlice';
import { exhibitionReducer } from '../features/exhibition/exhibitionSlice';

const rootReducer = combineReducers({
  league: leagueReducer,
  season: seasonReducer,
  coach: coachReducer,
  ui: uiReducer,
  exhibition: exhibitionReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['season', 'coach'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
