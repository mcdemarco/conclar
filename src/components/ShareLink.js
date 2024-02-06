import { useStoreState } from "easy-peasy";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import configData from "../config.json";

const ShareLink = ({shareConfig}) => {
    const mySchedule = useStoreState((state) => state.getMySchedule);
  // Don't show share link(s) unless there are items in mySchedule.
  if (mySchedule.length === 0) return <></>;
  const links = [];
  let key = 0;
  function addLink(linkItems, multi) {
    const link =  "../ids/" + linkItems;  // react router already resolves the path
    const baselink = configData.BASE_PATH + link;
    let absLink = `${window.location.origin}${baselink}`;
    if (shareConfig.hasOwnProperty("URL")) {
      absLink = shareConfig.URL + "ids/" + linkItems;
      links.push(
      <div key={key++} className="share-body">
        <div className="share-link">
          <a href={absLink}>
            {multi
              ? shareConfig.MULTIPLE_LINK_LABEL.replace(
                  "@number",
                  key + 1
                )
              : shareConfig.LINK_LABEL}
          </a>
        </div>
        <div className="share-qr-code">
          <QRCode value={absLink} />
        </div>
      </div>
      );
    } else {
      links.push(
      <div key={key++} className="share-body">
        <div className="share-link">
          <Link to={link}>
            {multi
              ? shareConfig.MULTIPLE_LINK_LABEL.replace(
                  "@number",
                  key + 1
                )
              : shareConfig.LINK_LABEL}
          </Link>
        </div>
        <div className="share-qr-code">
          <QRCode value={absLink} />
        </div>
      </div>
      );
    }   
  }
  let linkItems = "";
  mySchedule.forEach((item) => {
    // If item would make link exceed maximum length, form link and move on to next one.
    if (
      (linkItems.length + item.id.length) >
      shareConfig.MAX_LENGTH
    ) {
      addLink(linkItems, true);
      linkItems = "";
    }
    if (linkItems.length) linkItems += "~";
    linkItems += item.id;
  });
  addLink(linkItems, key > 0);

  const multipleDesc =
    key > 1 ? (
      <div className="share-body">
        {shareConfig.MULTIPLE_DESCRIPTION}
      </div>
    ) : (
      ""
    );

  return (
      <div>
    <div className="share-group select-show-timezone">
      <div className="share-head">
        {shareConfig.LABEL}
      </div>
      <div className="share-body">
        {shareConfig.DESCRIPTION}
      </div>
      {multipleDesc}
      {links}
      </div>
      </div>
  );
};

export default ShareLink;
