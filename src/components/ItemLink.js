
const ItemLink = ({ name, link, text }) => {
	return <div className={name}>
    <a href={link} target="_blank" rel="noreferrer">{text}</a>
		</div>;
};

export default ItemLink;
