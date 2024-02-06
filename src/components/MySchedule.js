import { useStoreState, useStoreActions } from "easy-peasy";
import configData from "../config.json";
import ProgramList from "./ProgramList";
import ShowPastItems from "./ShowPastItems";
import ShareLink from "./ShareLink";
import { LocalTime } from "../utils/LocalTime";

const MySchedule = () => {
  const mySchedule = useStoreState((state) => state.getMySchedule);
  const program = useStoreState((state) => state.program);
  const showPastItems = useStoreState((state) => state.showPastItems);
  const { expandSelected, collapseSelected } = useStoreActions((actions) => ({
    expandSelected: actions.expandSelected,
    collapseSelected: actions.collapseSelected,
  }));
  const noneExpanded = useStoreState((state) => state.noneExpanded);
  const allSelectedExpanded = useStoreState((state) => state.allSelectedExpanded);

  const filtered =
    LocalTime.isDuringCon(program) && !showPastItems
      ? LocalTime.filterPastItems(mySchedule)
      : mySchedule;

  const getShareLinks = () => {
    const shareLinks = [];
    let key = 0;
    for (const shareConfig of configData.PROGRAM.MY_SCHEDULE.SHARE) {
      shareLinks.push(<ShareLink key={key++} shareConfig={shareConfig}/>);
    };
    return <div className="all-share-linkss">{shareLinks}</div>;
  };

  return (
    <div className="my-schedule">
      <div className="page-heading">
        <h2>{configData.PROGRAM.MY_SCHEDULE.TITLE}</h2>
	<p>{configData.PROGRAM.MY_SCHEDULE.DESCRIPTION}</p>
      </div>
      <div className="result-filters">
        <div className="stack">
          <div className="filter-expand">
            <button disabled={allSelectedExpanded} onClick={expandSelected}>
              {configData.EXPAND.EXPAND_ALL_LABEL}
            </button>
            <button disabled={noneExpanded} onClick={collapseSelected}>
              {configData.EXPAND.COLLAPSE_ALL_LABEL}
            </button>
          </div>
        </div>
        <div className="filter-options">
          <ShowPastItems />
        </div>
      </div>
      <ProgramList program={filtered} />
      {getShareLinks()}
    </div>
  );
};

export default MySchedule;
