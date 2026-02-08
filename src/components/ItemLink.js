
const ItemLink = ({ name, link, text, enabled }) => {
  return <div className={name}>
    <a className={enabled ? null : "disabled"} href={enabled ? link : null} target="_blank" rel="noreferrer">{text}</a>
  </div>;
};

export default ItemLink;
