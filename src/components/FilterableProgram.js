import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactSelect from "react-select";
import { useStoreState, useStoreActions } from "easy-peasy";
import { Temporal } from "@js-temporal/polyfill";
import configData from "../config.json";
import TagSelectors from "./TagSelectors";
import ResetButton from "./ResetButton";
import ProgramList from "./ProgramList";
import ShowPastItems from "./ShowPastItems";
import { LocalTime } from "../utils/LocalTime";

const FilterableProgram = () => {
  const navigate = useNavigate();

  const program = useStoreState((state) => state.program);
  const locations = useStoreState((state) => state.locations);
  const tags = useStoreState((state) => state.tags);

  const showPastItems = useStoreState((state) => state.showPastItems);
  const { expandAll, collapseAll } = useStoreActions((actions) => ({
    expandAll: actions.expandAll,
    collapseAll: actions.collapseAll,
  }));
  const noneExpanded = useStoreState((state) => state.noneExpanded);
  const allExpanded = useStoreState((state) => state.allExpanded);

  const selLoc = useStoreState((state) => state.programSelectedLocations);
  const setSelLoc = useStoreActions(
    (actions) => actions.setProgramSelectedLocations
  );
  const selTags = useStoreState((state) => state.programSelectedTags);
  const setSelTags = useStoreActions(
    (actions) => actions.setProgramSelectedTags
  );
  const hideBefore = useStoreState((state) => state.programHideBefore);
  const setHideBefore = useStoreActions(
    (actions) => actions.setProgramHideBefore
  );
  const show12HourTime = useStoreState((state) => state.show12HourTime);
  const search = useStoreState((state) => state.programSearch);
  const setSearch = useStoreActions((actions) => actions.setProgramSearch);
  const resetProgramFilters = useStoreActions(
    (actions) => actions.resetProgramFilters
  );
  const programIsFiltered = useStoreState((state) => state.programIsFiltered);

  // User selected display limit.
  const programDisplayLimit = useStoreState(
    (state) => state.programDisplayLimit
  );
  const setProgramDisplayLimit = useStoreActions(
    (actions) => actions.setProgramDisplayLimit
  );
  // Current display limit, changes when user presses "show more". Resets whenever filters change.
  const [displayLimit, setDisplayLimit] = useState(
    parseInt(
      programDisplayLimit === null
        ? configData.PROGRAM.LIMIT.DEFAULT
        : programDisplayLimit
    )
  );

  const filtered = applyFilters(program);
  const total = filtered.length;
  const totalMessage =
    displayLimit !== "all" && displayLimit < total
      ? `Listing ${displayLimit} of ${total} items`
      : `Listing ${total} items`;
  const display =
    configData.PROGRAM.LIMIT.SHOW && !isNaN(displayLimit)
      ? filtered.slice(0, displayLimit)
      : filtered;

  /**
   * When filters change, set the display limit back to the selection.
   */
  function resetDisplayLimit() {
    setDisplayLimit(
      parseInt(
        programDisplayLimit === null
          ? configData.PROGRAM.LIMIT.DEFAULT
          : programDisplayLimit
      )
    );
  }

  /**
   * When reset filters pressed, reset the display limit and the program filters.
   */
  function resetLimitsAndFilters() {
    resetDisplayLimit();
    resetProgramFilters();
  }

  /**
   * Apply hide before time filter.
   * @param {array} program Program to filter.
   * @param {array} days Days to choose earliest from.
   * @returns {array} The program with items before start removed.
   */
  function filterHideBefore(program, minDay) {
    const beforeDate = Temporal.ZonedDateTime.from(
      minDay + "T" + hideBefore + "[" + configData.TIMEZONE + "]"
    );
    return program.filter(
      (item) =>
        Temporal.ZonedDateTime.compare(beforeDate, item.startDateAndTime) <= 0
    );
  }

  /**
   * Apply filters to the program array.
   * @param {array} program Array of program items.
   * @returns {array} The filtered array.
   */
  function applyFilters(program) {
    const term = search.trim().toLowerCase();

    // If no filters, return full program;
    if (term.length === 0 && selLoc.length === 0 && selTags === 0)
      return program;

    let filtered = program;

    // Filter by search term.
    if (term.length) {
      filtered = filtered.filter((item) => {
        if (item.title && item.title.toLowerCase().includes(term)) return true;
        if (item.desc && item.desc.toLowerCase().includes(term)) return true;
        if (item.people) {
          for (const person of item.people) {
            if (person.name && person.name.toLowerCase().includes(term))
              return true;
          }
        }
        return false;
      });
    }
    // Filter by location
    if (selLoc.length) {
      filtered = filtered.filter((item) => {
        for (const location of item.loc) {
          for (const selected of selLoc) {
            if (selected.value === location) return true;
          }
        }
        return false;
      });
    }
    // Filter by each tag dropdown.
    for (const tagType in selTags) {
      if (selTags[tagType].length) {
        filtered = filtered.filter((item) => {
          for (const tag of item.tags) {
            for (const selected of selTags[tagType]) {
              if (selected.value === tag.value) return true;
            }
          }
          return false;
        });
      }
    }
    if (LocalTime.isDuringCon(program) && !showPastItems) {
      filtered = LocalTime.filterPastItems(filtered);
    }
    if (!configData.HIDE_BEFORE.HIDE && hideBefore) {
      if (
        "days" in selTags &&
        Array.isArray(selTags.days) &&
        selTags.days.length > 0
      ) {
        // if days selected, take start time for first selected day.
        const minDay = selTags.days.reduce(
          (acc, curr) => (curr.value < acc ? curr.value : acc),
          selTags.days[0].value
        );
        filtered = filterHideBefore(filtered, minDay);
      } else if (filtered[0] && "tags" in filtered[0]) {
        // If days tag present on items get date of first programme item.
        const tag = filtered[0].tags.find((item) => item.category === "days");
        if (tag && "value" in tag) {
          const minDay = tag.value;
          filtered = filterHideBefore(filtered, minDay);
        }
      } else {
        // As backup get date from drop-down items.
        const labelledDays = tags.days.filter((item) => typeof item.label !== "undefined");
        const minDay = labelledDays.reduce(
          (acc, curr) => (curr.value < acc ? curr.value : acc),
          labelledDays[0].value
        );
        filtered = filterHideBefore(filtered, minDay);
      }
    }
    return filtered;
  }

  function limitDropDown() {
    function displayLimit(limit) {
      if (limit === null) return configData.PROGRAM.LIMIT.DEFAULT;
      if (limit === "all") return limit;
      if (isNaN(limit)) return configData.PROGRAM.LIMIT.DEFAULT;
      return limit;
    }
    if (configData.PROGRAM.LIMIT.SHOW) {
      const options = configData.PROGRAM.LIMIT.OPTIONS.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ));
      options.push(
        <option key="all" value="all">
          {configData.PROGRAM.LIMIT.ALL_LABEL}
        </option>
      );
      return (
        <div className="program-limit-select">
          <label htmlFor="display_limit">
            {configData.PROGRAM.LIMIT.LABEL}:{" "}
          </label>
          <select
            id="display_limit"
            name="display_limit"
            value={displayLimit(programDisplayLimit)}
            onChange={(e) => {
              setProgramDisplayLimit(e.target.value);
              setDisplayLimit(parseInt(e.target.value));
            }}
          >
            {options}
          </select>
        </div>
      );
    }
    return "";
  }

  const moreButton =
    displayLimit < total ? (
      <button
        className="show-more-button"
        onClick={() =>
          setDisplayLimit(
            parseInt(displayLimit) +
              configData.PROGRAM.LIMIT.SHOW_MORE.NUM_EXTRA
          )
        }
      >
        {configData.PROGRAM.LIMIT.SHOW_MORE.LABEL}
      </button>
    ) : (
      <span>{configData.PROGRAM.LIMIT.SHOW_MORE.NO_MORE}</span>
    );

  // create list of options for hide before time drop-down.
  const hideBeforeOptions = [
    <option value="" key="0">
      {configData.HIDE_BEFORE.PLACEHOLDER}
    </option>,
  ];
  for (const time of configData.HIDE_BEFORE.TIMES) {
    hideBeforeOptions.push(
      <option value={time.TIME} key={time.TIME}>
        {show12HourTime ? time.LABEL_12H : time.LABEL_24H}
      </option>
    );
  }
  const hideBeforeSelect = configData.HIDE_BEFORE.HIDE ? (
    <></>
  ) : (
    <div className="filter-hide-before">
      <label htmlFor="hide-before">{configData.HIDE_BEFORE.PLACEHOLDER}</label>
      <select
        id="hide-before"
        placeholder={configData.HIDE_BEFORE.PLACEHOLDER}
        value={hideBefore}
        onChange={(e) => {
          resetDisplayLimit();
          setHideBefore(e.target.value);
        }}
      >
        {hideBeforeOptions}
      </select>
    </div>
  );

  return (
    <div>
      <div className="filter">
        <div className="search-filters">
          <div className="filter-locations">
            <ReactSelect
              placeholder="Select locations"
              options={locations}
              isMulti
              isSearchable={configData.LOCATIONS.SEARCHABLE}
              value={selLoc}
              onChange={(value) => {
                console.log(value);
                resetDisplayLimit();
                setSelLoc(value);
                if (value.length) {
                  const locList = value.map((location) => location.value).join('~');
                  navigate('/loc/' + locList);
                }
                else {
                  navigate('/');
                }
              }}
              className="filter-container"
              classNamePrefix="filter-select"
            />
          </div>
          <TagSelectors
            tags={tags}
            selTags={selTags}
            setSelTags={setSelTags}
            tagConfig={configData.TAGS}
            resetLimit={resetDisplayLimit}
          />
          {hideBeforeSelect}
          <div className="filter-search">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="search"
              placeholder={configData.PROGRAM.SEARCH.SEARCH_LABEL}
              value={search}
              onChange={(e) => {
                resetDisplayLimit();
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="reset-filters">
          <ResetButton
            isFiltered={programIsFiltered}
            resetFilters={resetLimitsAndFilters}
          />
        </div>
        {limitDropDown()}
        <div className="result-filters">
          <div className="stack">
            <div className="filter-total">{totalMessage}</div>
            <div className="filter-expand">
              <button disabled={allExpanded} onClick={expandAll}>
                {configData.EXPAND.EXPAND_ALL_LABEL}
              </button>
              <button disabled={noneExpanded} onClick={collapseAll}>
                {configData.EXPAND.COLLAPSE_ALL_LABEL}
              </button>
            </div>
          </div>
          <div className="filter-options">
            <ShowPastItems />
          </div>
        </div>
      </div>
      <div className="program-page">
        <ProgramList program={display} />
      </div>
      <div className="result-filters">
        <div className="stack">
          <div className="filter-total">{totalMessage}</div>
        </div>
      </div>
      <div className="result-more-button">{moreButton}</div>
    </div>
  );
};

export default FilterableProgram;
