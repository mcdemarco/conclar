import PropTypes from "prop-types";
import { useStoreState, useStoreActions } from "easy-peasy";
import Day from "./Day";
import configData from "../config.json";
import { LocalTime } from "../utils/LocalTime";

const ProgramList = ({ program, uninteractive, forceExpanded }) => {
  const showLocalTime = useStoreState((state) => state.showLocalTime);
  const offset = useStoreState((state) => state.offset);

  const showPastItems = useStoreState((state) => state.showPastItems);
  const setShowPastItems = useStoreActions(
    (actions) => actions.setShowPastItems
  );

  const { expandAll, collapseAll } = useStoreActions((actions) => ({
    expandAll: actions.expandAll,
    collapseAll: actions.collapseAll,
  }));
  const noneExpanded = useStoreState((state) => state.noneExpanded);
  const allExpanded = useStoreState((state) => state.allExpanded);

  const rows = [];
  let itemRows = [];
  let curDate = null;
  
  const pastItemsCheckbox =
    isDuringCon(program) && configData.SHOW_PAST_ITEMS.SHOW_CHECKBOX ? (
      <div className="past-items-checkbox switch-wrapper">
        <input
          id={LocalTime.pastItemsClass}
          name={LocalTime.pastItemsClass}
          className="switch"
          type="checkbox"
          checked={showPastItems}
          onChange={handleShowPastItems}
        />
        <label htmlFor={LocalTime.pastItemsClass}>
          {configData.SHOW_PAST_ITEMS.CHECKBOX_LABEL}
        </label>
      </div>
    ) : (
      ""
    );

  const filters = 
    uninteractive ? (
        ""
      ) : (
      <div className="result-filters">
        <div className="filter-options">
          {pastItemsCheckbox}
        </div>
      </div>
    );

  if (program === null || program.length === 0) {
    return (
      <div className="program-container">
        {filters}
        <div className="program">
          <div className="program-empty">No items found.</div>
        </div>
      </div>
    );
  }

  /* Non-empty program processing. */

  const filtered = applyFilters(program);

  const total = filtered ? filtered.length : 0;
  const totalMessage = `Listing ${total} items`;

  const expander = 
    uninteractive ? (
        ""
      ) : (
        <div className="result-filters">
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
    );

  function applyFilters(program) {
    let filtered = program;

    if (isDuringCon(program) && !showPastItems) {
      // Filter by past item state.
      const now = LocalTime.dateToConTime(new Date());
      //console.log("Showing items after", now.date, now.time, "(adjusted con time).");
      filtered = filtered.filter((item) => {
        // eslint-disable-next-line
        return (
          now.date < item.date ||
          (now.date === item.date && now.time <= item.time)
        );
      });
    }
    return filtered;
  }

  function isDuringCon(program) {
    return program && program.length ? LocalTime.inConTime(program) : false;
  }

  function handleShowPastItems(event) {
    setShowPastItems(event.target.checked);
  }

  filtered.forEach((item) => {
    if (item.date !== curDate) {
      if (itemRows.length > 0) {
        rows.push(
          <Day
            key={curDate}
            date={curDate}
            items={itemRows}
            forceExpanded={forceExpanded}
          />
        );
        itemRows = [];
      }
      curDate = item.date;
    }
    itemRows.push(item);
  });
  rows.push(
    <Day
      key={curDate}
      date={curDate}
      items={itemRows}
      forceExpanded={forceExpanded}
    />
  );

  const localTime =
    offset === null ? (
      <div className="time-local-message">{configData.LOCAL_TIME.FAILURE}</div>
    ) : offset !== 0 && showLocalTime ? (
      <div className="time-local-message">{configData.LOCAL_TIME.NOTICE}</div>
    ) : (
      ""
    );

  return (
    <div className="program-container">
      {filters}
      {expander}
      {localTime}
      <div className="program">{rows}</div>
    </div>
  );
};

ProgramList.defaultProps = {
  forceExpanded: false,
};

ProgramList.propTypes = {
  program: PropTypes.array,
  forceExpanded: PropTypes.bool,
};

export default ProgramList;
