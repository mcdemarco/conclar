import React from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import ProgramList from "./ProgramList";

const Person = ({ people, program, offset, handler }) => {
  const params = useParams();
  const person = people.find((person) => person.id === params.id);
  if (!person)
    return (
        <div className="error">
          Person id <span>{params.id}</span> was not found.
        </div>
    );
  const img = (person.links && person.links.img) ? <img src={person.links.img} alt={person.name} /> : "";
  const safeBio = person.bio ? DOMPurify.sanitize(person.bio) : "";
  return (
    <div className="person">
      <h2 className="person-name">Person: {person.name}</h2>
      <div className="person-image">{img}</div>
      <div
        className="person-bio"
        dangerouslySetInnerHTML={{ __html: safeBio }}
      />
      <ProgramList
        program={program.filter((item) => {
          if (item.people) {
            for (const person of item.people) {
              if (person.id === params.id) return true;
            }
          }
          return false;
        })}
        offset={offset}
        handler={handler}
      />
    </div>
  );
};

export default Person;
