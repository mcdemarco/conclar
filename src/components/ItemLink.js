
const ItemLink = ({ name, link, text }) => {
	if (name === "item-links-recording")
		return <div className={name}>
    <a href={link} target="_blank" rel="noreferrer">{text}</a>
		</div>;
	return <div className={name}>
    <a href={link}>{text}</a>
		</div>;
};

export default ItemLink;
