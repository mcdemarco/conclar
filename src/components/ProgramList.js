import PropTypes from "prop-types";
import { useStoreState, useStoreActions } from "easy-peasy";
import Day from "./Day";
import configData from "../config.json";

const ProgramList = ({ program, uninteractive, forceExpanded }) => {
  const showLocalTime = useStoreState((state) => state.showLocalTime);
  const offset = useStoreState((state) => state.offset);

  const { expandAll, collapseAll } = useStoreActions((actions) => ({
    expandAll: actions.expandAll,
    collapseAll: actions.collapseAll,
  }));
  const noneExpanded = useStoreState((state) => state.noneExpanded);
  const allExpanded = useStoreState((state) => state.allExpanded);

  const rows = [];
  let itemRows = [];
  let curDate = null;

  if (program === null || program.length === 0) {
    return (
      <div className="program">
        <div className="program-empty">No items found.</div>
      </div>
    );
  }

  const total = program.length;
  const totalMessage = `Listing ${total} items`;

  program.forEach((item) => {
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

  const filters = 
    uninteractive ? (
        ""
      ) : (
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
      </div>
    );

  return (
    <div className="program-container">
      {filters}
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
