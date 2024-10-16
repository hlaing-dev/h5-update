import { createSlice } from "@reduxjs/toolkit";

const ExploreSlice = createSlice({
  name: "explore",
  initialState: {
    activeTab: 1,
    sort: "by_default",
    class: "",
    area: "",
    year: "",
    activeNav: "",
    activeRank: "",
    activeWeek: null,
  },
  reducers: {
    setActiveTab: (state, { payload }) => {
      state.activeTab = payload;
    },
    setActiveNav: (state, { payload }) => {
      state.activeNav = payload;
    },
    setActiveRank: (state, { payload }) => {
      state.activeRank = payload;
    },
    setActiveWeek: (state, { payload }) => {
      state.activeWeek = payload;
    },
    setSort: (state, { payload }) => {
      state.sort = payload;
    },
    setClass: (state, { payload }) => {
      state.class = payload;
    },
    setArea: (state, { payload }) => {
      state.area = payload;
    },
    setYear: (state, { payload }) => {
      state.year = payload;
    },
  },
});

export const {
  setActiveTab,
  setSort,
  setClass,
  setArea,
  setYear,
  setActiveNav,
  setActiveRank,
  setActiveWeek
} = ExploreSlice.actions;
export default ExploreSlice.reducer;
